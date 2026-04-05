"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";
import Badge from "@/components/badge";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

// Lifecycle steps shown in the progress bar
const PROGRESS_STEPS = [
  { label: "Approved",  match: (s) => ["accepted", "payment_submitted", "preparing", "ready", "completed"].includes(s) },
  { label: "Paid",      match: (s) => ["preparing", "ready", "completed"].includes(s) },
  { label: "Preparing", match: (s) => ["preparing", "ready", "completed"].includes(s) },
  { label: "Ready",     match: (s) => ["ready", "completed"].includes(s) },
  { label: "Done",      match: (s) => s === "completed" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const ctrl = new AbortController();

    const u = getUser();
    const token = getToken();

    if (u?.role === "staff") { router.replace("/staff/orders"); return; }
    if (!token) { router.replace("/login?next=/orders"); return; }

    fetch(`${API_BASE}/api/orders/my`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
    })
      .then((r) => { if (!r.ok) throw new Error(`Server returned ${r.status}`); return r.json(); })
      .then((d) => { if (mountedRef.current) setOrders(Array.isArray(d) ? d : []); })
      .catch((err) => { if (err.name !== "AbortError" && mountedRef.current) setError(err.message); })
      .finally(() => { if (mountedRef.current) setLoading(false); });

    return () => { mountedRef.current = false; ctrl.abort(); };
  }, [router]);

  // Student confirms pickup — READY → COMPLETED
  async function confirmPickup(orderId) {
    setCompletingId(orderId);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not complete order");
      if (mountedRef.current) {
        setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: "COMPLETED" } : o));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      if (mountedRef.current) setCompletingId(null);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="ordersHero">
        <div className="menuKicker">My Orders</div>
        <h1 className="sectionHeading">Your order story</h1>
      </div>
      <div style={{ marginTop: 32, display: "grid", gap: 18 }}>
        {[140, 110, 110].map((h, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 22, height: h, animation: "pulse 1.4s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    </Layout>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <Layout>
      <div className="ordersHero">
        <div className="menuKicker">My Orders</div>
        <h1 className="sectionHeading">Your order story</h1>
      </div>
      <div style={{ marginTop: 32, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 18, padding: "22px 24px", color: "#dc2626", fontWeight: 700 }}>
        Could not load orders — {error}.{" "}
        <button onClick={() => window.location.reload()} style={{ background: "none", border: "none", color: "#dc2626", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}>
          Refresh
        </button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="ordersHero">
        <div>
          <div className="menuKicker">My Orders</div>
          <h1 className="sectionHeading">Your order story</h1>
          <p className="sectionSub">Track every step from approval to pickup.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "56px 24px", color: "var(--muted)", fontWeight: 700, fontSize: 17 }}>
          No orders yet.{" "}
          <a href="/menu" style={{ color: "var(--brand)", textDecoration: "underline" }}>Browse the menu</a>
        </div>
      ) : (
        <div className="orderGrid orderGridRefined">
          {orders.map((order) => {
            const status = (order.status ?? "PENDING").toLowerCase();
            const itemsSummary = Array.isArray(order.items)
              ? order.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")
              : "—";
            const isReady = status === "ready";
            const isCompleting = completingId === order._id;

            // Status-specific inline messages
            const statusMsg = {
              pending: "Waiting for staff to review your order.",
              accepted: "Order accepted! Head to your payment link to pay.",
              payment_submitted: "Payment submitted. Staff is confirming — preparation will start soon.",
              preparing: "Your order is being prepared in the kitchen!",
              ready: "Your order is ready! Come pick it up and confirm below.",
              completed: "Picked up! Enjoy your meal.",
              cancelled: "This order was rejected by staff.",
            }[status];

            return (
              <div className="orderCard orderCardRefined" key={order._id}
                style={isReady ? { borderColor: "#16a34a", borderWidth: 2 } : undefined}>
                {/* Header */}
                <div className="orderTop">
                  <div>
                    <div className="orderId">#{order._id.slice(-6).toUpperCase()}</div>
                    <div className="orderMiniMeta">
                      {order.canteen ? (
                        <span style={{ marginRight: 8, fontWeight: 700 }}>
                          {order.canteen === "MAIN" ? "🍽️" : "☕"} {order.canteen}
                        </span>
                      ) : null}
                      {order.slot || "No slot"}
                    </div>
                  </div>
                  <div className="staffbadges">
                    <Badge status={status} />
                  </div>
                </div>

                {/* Status message */}
                {statusMsg && (
                  <div style={{
                    margin: "10px 0", padding: "9px 13px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: isReady ? "#f0fdf4" : status === "cancelled" ? "#fff5f5" : "#f9fafb",
                    color: isReady ? "#15803d" : status === "cancelled" ? "#dc2626" : "var(--muted)",
                    border: `1px solid ${isReady ? "#86efac" : status === "cancelled" ? "#fecaca" : "rgba(0,0,0,0.06)"}`,
                  }}>
                    {statusMsg}
                  </div>
                )}

                {/* Items */}
                <div className="orderMeta orderMetaRefined">
                  <div><strong>Items:</strong> {itemsSummary}</div>
                </div>

                {/* Progress bar */}
                <div className="orderProgressRow">
                  {PROGRESS_STEPS.map(({ label, match }) => (
                    <div key={label} className={`progressStep ${match(status) ? "done" : ""}`}>{label}</div>
                  ))}
                </div>

                {/* Amount + slot */}
                <div className="staffMetaRow">
                  <span className="amountChip">₹{order.totalAmount}</span>
                  <span className="slotChip">{order.slot || "—"}</span>
                </div>

                {/* Actions */}
                <div className="orderActions">
                  {/* Pay link — shown when ACCEPTED */}
                  {order.paymentToken && status === "accepted" && (
                    <a href={`/pay/${order.paymentToken}`} className="primarySmallBtn">
                      Pay Now →
                    </a>
                  )}

                  {/* View payment status — shown for in-progress states */}
                  {order.paymentToken && ["payment_submitted", "preparing"].includes(status) && (
                    <a href={`/pay/${order.paymentToken}`} className="secondaryBtn">
                      View Payment Status
                    </a>
                  )}

                  {/* Confirm Pickup — shown only when READY */}
                  {isReady && (
                    <button
                      onClick={() => confirmPickup(order._id)}
                      disabled={isCompleting}
                      style={{
                        padding: "10px 22px", borderRadius: 14, fontWeight: 800, fontSize: 14,
                        background: isCompleting ? "#d1d5db" : "#16a34a",
                        color: "white", border: "none", cursor: isCompleting ? "not-allowed" : "pointer",
                        boxShadow: isCompleting ? "none" : "0 8px 20px rgba(22,163,74,0.25)",
                        transition: "all 0.2s",
                      }}
                    >
                      {isCompleting ? "Confirming…" : "✓ Confirm Pickup"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
