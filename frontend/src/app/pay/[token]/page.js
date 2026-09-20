"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout";
import Badge from "@/components/badge";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

const STATUS_INFO = {
  ACCEPTED: {
    heading: "Complete Payment",
    sub: "Pay securely via Razorpay — UPI, cards, netbanking and wallets are supported.",
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
  const [razorpayInfo, setRazorpayInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

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
        setRazorpayInfo(data.razorpay || null);
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
    // Stop polling once terminal or no longer in a waiting state.
    // ACCEPTED is included so a payment confirmed via webhook (another device,
    // or this tab closed and reopened) is picked up without the user acting.
    const pollStates = ["ACCEPTED", "PAYMENT_SUBMITTED", "PREPARING"];
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

  // Loads the Razorpay Checkout script once (CDN — no npm dependency needed).
  function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load payment SDK")));
        return;
      }
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_SRC;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load payment SDK"));
      document.body.appendChild(script);
    });
  }

  // ── Student pays via Razorpay Checkout ─────────────────────────────────────
  async function handlePay() {
    if (!razorpayInfo?.orderId || !razorpayInfo?.keyId) {
      setPayError("Payment session not ready yet. Please refresh.");
      return;
    }

    setPaying(true);
    setPayError(null);
    try {
      await loadRazorpayScript();

      const rzp = new window.Razorpay({
        key: razorpayInfo.keyId,
        order_id: razorpayInfo.orderId,
        amount: Math.round((order?.totalAmount ?? 0) * 100),
        currency: "INR",
        name: "SIST Smart Canteen",
        description: `Order #${order?._id?.slice(-6).toUpperCase()}`,
        prefill: { name: getUser()?.name || "" },
        theme: { color: "#ff7a00" },
        // Explicitly enable UPI alongside the other methods — without this key
        // Razorpay still shows every method enabled on the account, but this
        // guarantees UPI isn't accidentally left out and none of the others are
        // dropped. Whether UPI actually appears/works is ultimately gated by the
        // Razorpay account/test-mode configuration, not this app's code.
        method: { upi: true, card: true, netbanking: true, wallet: true },
        handler: async (response) => {
          try {
            const res = await fetch(`${API_BASE}/api/pay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Payment verification failed");
            if (mountedRef.current) setOrder(data.order);
          } catch (err) {
            if (mountedRef.current) setPayError(err.message || "Payment verification failed. It will be confirmed automatically shortly.");
          } finally {
            if (mountedRef.current) setPaying(false);
          }
        },
        modal: {
          ondismiss: () => { if (mountedRef.current) setPaying(false); },
        },
      });

      rzp.on("payment.failed", () => {
        if (mountedRef.current) {
          setPayError("Payment failed or was declined. You can try again.");
          setPaying(false);
        }
        // The webhook is the source of truth for the FAILED state — give it a
        // moment to arrive, then refetch so the UI reflects the backend record
        // rather than only this client-side event.
        setTimeout(() => {
          if (mountedRef.current) fetchOrder(new AbortController().signal);
        }, 3000);
      });

      rzp.open();
    } catch (err) {
      setPayError(err.message || "Could not start payment.");
      setPaying(false);
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
  const isPaid = order?.paymentStatus === "PAID";
  const paymentFailed = order?.paymentStatus === "FAILED";
  const info = STATUS_INFO[currentStatus] ?? STATUS_INFO.ACCEPTED;
  const isPayable = currentStatus === "ACCEPTED" && !isPaid;
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

          {!isLoggedIn && isPayable && (
            <div style={{ marginTop: 14, background: "#fefce8", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 14px", fontSize: 14, fontWeight: 700, color: "#92400e" }}>
              <a href={`/login?next=/pay/${token}`} style={{ color: "var(--brand)", textDecoration: "underline" }}>Sign in</a> to pay.
            </div>
          )}
        </div>

        {/* ── Right: QR + action ── */}
        <div className="detailSideCard">
          <div className="detailSectionTitle">
            {isPayable ? "Complete Payment" : "Order Status"}
          </div>

          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 14px", borderRadius: 12, background: sc.bg, border: `1.5px solid ${sc.border}` }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: info.color, flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: 14, color: sc.text }}>
              {isPayable ? (paymentFailed ? "PAYMENT FAILED" : "PAYMENT PENDING") : currentStatus.replace(/_/g, " ")}
            </span>
          </div>

          {/* Verified-payment details — shown whenever paymentStatus is PAID,
              regardless of order.status (which may already be PREPARING/READY). */}
          {isPaid && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 18, padding: "18px 20px", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 16, color: "#15803d", marginBottom: 8 }}>Payment Verified ✓</div>
              <div style={{ fontSize: 14, color: "#166534", fontWeight: 700, lineHeight: 1.8 }}>
                <div>₹{order?.totalAmount} paid</div>
                {order?.paymentMethod && <div>Payment method: {order.paymentMethod.toUpperCase()}</div>}
                {order?.razorpayPaymentId && <div>Transaction ID: {order.razorpayPaymentId}</div>}
              </div>
            </div>
          )}

          {/* Payment failed banner — retry stays available (same Razorpay order accepts another attempt) */}
          {paymentFailed && isPayable && (
            <div style={{ background: "#fff5f5", border: "1.5px solid #fecaca", borderRadius: 18, padding: "16px 20px", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#dc2626" }}>Payment Failed — Try Again</div>
              <div style={{ fontSize: 13, color: "#b91c1c", fontWeight: 600, marginTop: 4 }}>
                Your last payment attempt didn&apos;t go through. No amount was captured.
              </div>
            </div>
          )}

          {/* Pay card — only when payment pending. Razorpay Checkout itself offers
              UPI (with its own QR), cards, netbanking and wallets. */}
          {isPayable && (
            <div className="upiHintBox">
              <div className="upiHintTitle">Amount to pay</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", margin: "4px 0 8px" }}>
                ₹{order?.totalAmount}
              </div>
              <div className="upiHintList">UPI · Cards · Netbanking · Wallets — via Razorpay</div>
            </div>
          )}

          {/* Status card for post-payment states */}
          {!isPayable && (
            <div style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, borderRadius: 18, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: info.color, marginBottom: 6 }}>
                {currentStatus === "PAYMENT_SUBMITTED" && "Waiting for staff to confirm your payment…"}
                {currentStatus === "PREPARING"         && "Kitchen is preparing your order!"}
                {currentStatus === "READY"             && "Head to the counter — your order is ready!"}
                {currentStatus === "COMPLETED"         && "Order complete. Enjoy your meal!"}
              </div>
              {["ACCEPTED", "PAYMENT_SUBMITTED", "PREPARING"].includes(currentStatus) && (
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
                  This page updates automatically every 15 seconds.
                </div>
              )}
            </div>
          )}

          {payError && (
            <div style={{ marginTop: 14, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
              {payError}
            </div>
          )}

          <div className="detailActionStack" style={{ marginTop: 18 }}>
            {isPayable && isLoggedIn && (
              <button
                className="authButton"
                onClick={handlePay}
                disabled={paying}
                style={{ opacity: paying ? 0.7 : 1, cursor: paying ? "not-allowed" : "pointer" }}
              >
                {paying ? "Processing…" : paymentFailed ? `Try Again — Pay ₹${order?.totalAmount}` : `Pay ₹${order?.totalAmount}`}
              </button>
            )}
            <a href="/orders" className="secondaryBtn">Back to Orders</a>
          </div>

          {isPayable && (
            <div className="paymentNoteBox">
              Payment is verified automatically once completed — no need to notify staff manually.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
