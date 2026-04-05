"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout";
import Badge from "@/components/badge";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const STATUS_INFO = {
  ACCEPTED: {
    heading: "Scan & Pay",
    sub: "Scan the QR code with any UPI app, then click \"I've Paid\" to notify the kitchen.",
    color: "#d97706",
  },
  PAYMENT_SUBMITTED: {
    heading: "Payment Submitted",
    sub: "Your payment notification has been sent. Staff will confirm and start preparing your order.",
    color: "#2563eb",
  },
  PREPARING: {
    heading: "Being Prepared",
    sub: "Staff confirmed your payment. Your order is now being prepared in the kitchen.",
    color: "#d97706",
  },
  READY: {
    heading: "Ready for Pickup!",
    sub: "Your order is ready. Head to the counter and confirm pickup on the Orders page.",
    color: "#16a34a",
  },
  COMPLETED: {
    heading: "Order Completed",
    sub: "You have picked up your order. Thank you!",
    color: "#16a34a",
  },
};

export default function PaymentPage() {
  const { token } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const mountedRef = useRef(true);

  // ── Fetch current order state via payment token ───────────────────────────
  const fetchOrder = useCallback(async (signal) => {
    try {
      const res = await fetch(`${API_BASE}/api/pay/verify/${token}`, { signal });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Invalid payment link");
      }
      const data = await res.json();
      if (mountedRef.current) {
        setOrder(data.order);
        setFetchError(null);
      }
      return data.order;
    } catch (err) {
      if (err.name === "AbortError") return null;
      if (mountedRef.current) setFetchError(err.message || "Could not load payment session.");
      return null;
    }
  }, [token]);

  // Initial load — single fetch, no loop
  useEffect(() => {
    mountedRef.current = true;
    const ctrl = new AbortController();
    fetchOrder(ctrl.signal).finally(() => {
      if (mountedRef.current) setLoading(false);
    });
    return () => {
      mountedRef.current = false;
      ctrl.abort();
    };
  }, [fetchOrder]);

  // Poll every 15 s only while in intermediate states.
  // Each tick captures its own AbortController — the interval id is captured by
  // closure so the cleanup always cancels the exact interval it started.
  useEffect(() => {
    if (!order) return;
    // Stop polling once terminal or no longer in a waiting state
    const pollStates = ["PAYMENT_SUBMITTED", "PREPARING"];
    if (!pollStates.includes(order.status)) return;

    const iv = setInterval(async () => {
      const ctrl = new AbortController();
      const updated = await fetchOrder(ctrl.signal);
      if (updated && !pollStates.includes(updated.status)) {
        clearInterval(iv);
      }
    }, 15_000);

    return () => clearInterval(iv);
  }, [order?.status, fetchOrder]);

  // ── Student submits payment notification ──────────────────────────────────
  async function handleSubmitPayment() {
    const authToken = getToken();
    if (!authToken) {
      setSubmitError("You must be signed in to submit payment.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE}/api/orders/${order._id}/submit-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      setSubmitted(true);
      setOrder((prev) => ({ ...prev, status: "PAYMENT_SUBMITTED" }));
    } catch (err) {
      setSubmitError(err.message || "Could not reach server.");
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="paymentHero">
        <div className="menuKicker">QR payment</div>
        <h1 className="sectionHeading">Loading…</h1>
      </div>
      <div style={{ marginTop: 32, display: "grid", gap: 14 }}>
        {[160, 100].map((h, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 22, height: h, animation: "pulse 1.4s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    </Layout>
  );

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetchError) return (
    <Layout>
      <div className="paymentHero">
        <div className="menuKicker">QR payment</div>
        <h1 className="sectionHeading">Session unavailable</h1>
        <p className="sectionSub">{fetchError}</p>
      </div>
      <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => { setFetchError(null); setLoading(true); const ctrl = new AbortController(); fetchOrder(ctrl.signal).finally(() => { if (mountedRef.current) setLoading(false); }); }}
          style={{ padding: "10px 22px", borderRadius: 14, fontWeight: 800, fontSize: 14, background: "var(--brand)", color: "white", border: "none", cursor: "pointer" }}
        >
          Retry
        </button>
        <a href="/orders" className="secondaryBtn">Back to Orders</a>
      </div>
    </Layout>
  );

  const currentStatus = order?.status ?? "ACCEPTED";
  const info = STATUS_INFO[currentStatus] ?? STATUS_INFO.ACCEPTED;
  const isSubmittable = currentStatus === "ACCEPTED" && !submitted;
  const isLoggedIn = !!getUser();

  const itemsSummary = Array.isArray(order?.items)
    ? order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")
    : "—";

  const statusColors = {
    ACCEPTED:          { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
    PAYMENT_SUBMITTED: { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
    PREPARING:         { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    READY:             { bg: "#f0fdf4", border: "#86efac", text: "#15803d" },
    COMPLETED:         { bg: "#f0fdf4", border: "#6ee7b7", text: "#166534" },
  };
  const sc = statusColors[currentStatus] ?? statusColors.ACCEPTED;

  return (
    <Layout>
      <div className="paymentHero">
        <div className="menuKicker">QR payment · {order?.canteen ?? ""} Canteen</div>
        <h1 className="sectionHeading">{info.heading}</h1>
        <p className="sectionSub">{info.sub}</p>
      </div>

      <div className="detailGrid">
        {/* ── Left: order summary ── */}
        <div className="detailMainCard">
          <div className="detailSectionTitle">Order Summary</div>

          <div className="detailItemsList">
            <div className="detailItemRow">
              <div>
                <div className="detailItemName">Order #{order?._id?.slice(-6).toUpperCase()}</div>
                <div className="detailItemNote">{itemsSummary}</div>
              </div>
              <div className="detailItemRight"><strong>₹{order?.totalAmount}</strong></div>
            </div>
            <div className="detailItemRow">
              <div className="detailItemName">Pickup Slot</div>
              <div className="detailItemRight"><span className="slotChip">{order?.slot || "—"}</span></div>
            </div>
          </div>

          <div className="detailSummaryBox" style={{ marginTop: 20 }}>
            <div className="detailSummaryRow">
              <span>Canteen</span><strong>{order?.canteen ?? "—"}</strong>
            </div>
            <div className="detailSummaryRow total">
              <span>Total</span><strong>₹{order?.totalAmount}</strong>
            </div>
            <div className="detailSummaryRow">
              <span>Status</span>
              <Badge status={currentStatus.toLowerCase()} />
            </div>
          </div>

          {!isLoggedIn && isSubmittable && (
            <div style={{ marginTop: 14, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#92400e" }}>
              <a href={`/login?next=/pay/${token}`} style={{ color: "var(--brand)", textDecoration: "underline" }}>Sign in</a> to submit payment.
            </div>
          )}
        </div>

        {/* ── Right: QR + action ── */}
        <div className="detailSideCard">
          <div className="detailSectionTitle">
            {currentStatus === "ACCEPTED" ? "Scan & Pay" : "Order Status"}
          </div>

          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: sc.bg, border: `1.5px solid ${sc.border}` }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: info.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: sc.text }}>{currentStatus.replace(/_/g, " ")}</span>
          </div>

          {/* QR code — only when payment pending */}
          {currentStatus === "ACCEPTED" && (
            <>
              <div className="qrBox qrBoxRefined">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=canteen@sist&pn=SISTCanteen&am=${order?.totalAmount}&tn=Order-${order?._id?.slice(-6)}`}
                  alt="UPI QR Code"
                  className="qrImage qrImageRefined"
                  loading="lazy"
                />
              </div>
              <div className="upiHintBox">
                <div className="upiHintTitle">Pay via</div>
                <div className="upiHintList">Google Pay · PhonePe · Paytm · BHIM UPI</div>
              </div>
            </>
          )}

          {/* Status card for post-payment states */}
          {currentStatus !== "ACCEPTED" && (
            <div style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: info.color, marginBottom: 6 }}>
                {currentStatus === "PAYMENT_SUBMITTED" && "Waiting for staff to confirm your payment…"}
                {currentStatus === "PREPARING"         && "Kitchen is preparing your order!"}
                {currentStatus === "READY"             && "Head to the counter — your order is ready!"}
                {currentStatus === "COMPLETED"         && "Order complete. Enjoy your meal!"}
              </div>
              {["PAYMENT_SUBMITTED", "PREPARING"].includes(currentStatus) && (
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                  This page updates automatically every 15 seconds.
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div style={{ marginTop: 14, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
              {submitError}
            </div>
          )}

          <div className="detailActionStack" style={{ marginTop: 18 }}>
            {isSubmittable && isLoggedIn && (
              <button
                className="authButton"
                onClick={handleSubmitPayment}
                disabled={submitting}
                style={{ opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Submitting…" : "I've Paid — Notify Kitchen"}
              </button>
            )}
            <a href="/orders" className="secondaryBtn">Back to Orders</a>
          </div>

          {isSubmittable && (
            <div className="paymentNoteBox">
              After paying via UPI, click <strong>I&apos;ve Paid</strong> to notify staff.
              Staff will verify and begin preparing your order.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
