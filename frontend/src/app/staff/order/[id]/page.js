"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/layout";
import Badge from "@/components/badge";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function authHeaders() {
  const t = typeof window !== "undefined" ? getToken() : null;
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

function normalise(raw) {
  return {
    id: raw._id,
    student: raw.student && typeof raw.student === "object" ? raw.student.name ?? "Student" : "Student",
    items: Array.isArray(raw.items)
      ? raw.items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price }))
      : [],
    slot: raw.slot ?? "—",
    canteen: raw.canteen ?? "—",
    status: (raw.status ?? "PENDING").toLowerCase(),
    total: raw.totalAmount ?? 0,
    paymentToken: raw.paymentToken ?? null,
  };
}

// Ordered workflow steps shown in progress bar
const WORKFLOW = ["accepted", "payment_submitted", "preparing", "ready", "completed"];

export default function StaffOrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [deciding, setDeciding] = useState(null);
  const [decisionError, setDecisionError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const [actionLoading, setActionLoading] = useState(null); // "confirm-payment" | "ready"
  const [actionError, setActionError] = useState(null);

  const mountedRef = useRef(true);

  // Redirect non-staff
  useEffect(() => {
    const u = getUser();
    if (u && u.role !== "staff") router.replace("/orders");
  }, [router]);

  const loadOrder = useCallback(async (signal) => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/staff/orders/${id}`, { headers: authHeaders(), signal });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const raw = await res.json();
      if (!mountedRef.current) return;
      const norm = normalise(raw);
      setOrder(norm);
      if (norm.paymentToken) setPaymentUrl(`/pay/${norm.paymentToken}`);
    } catch (err) {
      if (err.name === "AbortError") return;
      if (mountedRef.current) setLoadError(err.message ?? "Failed to load order");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    mountedRef.current = true;
    const ctrl = new AbortController();
    loadOrder(ctrl.signal);
    return () => { mountedRef.current = false; ctrl.abort(); };
  }, [loadOrder]);

  // ── Accept / Reject ───────────────────────────────────────────────────────
  async function sendDecision(decision) {
    setDeciding(decision);
    setDecisionError(null);
    try {
      const res = await fetch(`${API_BASE}/api/staff/orders/${id}/decision`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);
      if (decision === "ACCEPT") {
        setOrder((prev) => ({ ...prev, status: "accepted" }));
        if (data.paymentUrl) setPaymentUrl(data.paymentUrl);
      } else {
        setOrder((prev) => ({ ...prev, status: "cancelled" }));
      }
    } catch (err) {
      setDecisionError(err.message ?? "Action failed.");
    } finally {
      if (mountedRef.current) setDeciding(null);
    }
  }

  // ── Staff confirms payment (PAYMENT_SUBMITTED → PREPARING) ────────────────
  async function confirmPayment() {
    setActionLoading("confirm-payment");
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/api/staff/orders/${id}/confirm-payment`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Confirmation failed");
      if (mountedRef.current) setOrder((prev) => ({ ...prev, status: "preparing" }));
    } catch (err) {
      if (mountedRef.current) setActionError(err.message ?? "Could not confirm payment.");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  // ── Staff marks order ready (PREPARING → READY) ───────────────────────────
  async function markReady() {
    setActionLoading("ready");
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/api/staff/orders/${id}/status`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify({ status: "READY" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      if (mountedRef.current) setOrder((prev) => ({ ...prev, status: "ready" }));
    } catch (err) {
      if (mountedRef.current) setActionError(err.message ?? "Could not mark ready.");
    } finally {
      if (mountedRef.current) setActionLoading(null);
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="staffHero">
        <div className="menuKicker">Staff panel</div>
        <h1 className="sectionHeading">Loading order…</h1>
      </div>
      <div style={{ marginTop: 28, display: "grid", gap: 14 }}>
        {[90, 56, 56].map((h, i) => (
          <div key={i} style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 22, height: h, animation: "pulse 1.4s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    </Layout>
  );

  if (loadError) return (
    <Layout>
      <div className="staffHero">
        <BackBtn onClick={() => router.push("/staff/orders")} />
        <div className="menuKicker">Staff panel</div>
        <h1 className="sectionHeading">Order not found</h1>
      </div>
      <div style={{ marginTop: 28, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 18, padding: "22px 24px", color: "#dc2626", fontWeight: 700 }}>
        {loadError}
      </div>
    </Layout>
  );

  const { status } = order;

  return (
    <Layout>
      {/* Hero */}
      <div className="staffHero">
        <BackBtn onClick={() => router.push("/staff/orders")} />
        <div className="menuKicker">Staff panel · {order.canteen} Canteen</div>
        <h1 className="sectionHeading">Order #{order.id.slice(-6).toUpperCase()}</h1>
        <p className="sectionSub">Manage this order through each stage of the workflow.</p>
      </div>

      {/* Main card */}
      <div style={cardStyle}>
        {/* Header */}
        <div className="staffOrderTop">
          <div>
            <div className="staffOrderId">#{order.id.slice(-6).toUpperCase()}</div>
            <div className="staffStudentName">{order.student}</div>
          </div>
          <div className="staffbadges">
            <Badge status={status} />
          </div>
        </div>

        <Divider />

        {/* Items */}
        <div>
          <SectionLabel>Items Ordered</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {order.items.map((item, i) => (
              <div key={i} style={itemRowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={qtyBadgeStyle}>×{item.qty}</span>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 800, color: "var(--muted)" }}>₹{item.price * item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* Slot + total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span className="slotChip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 5 }}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {order.slot}
          </span>
          <span className="amountChip" style={{ fontSize: 16, fontWeight: 900 }}>₹{order.total}</span>
        </div>

        {/* Payment link banner */}
        {paymentUrl && !["pending", "cancelled"].includes(status) && (
          <>
            <Divider />
            <div style={paymentBannerStyle}>
              <span style={{ fontWeight: 700, fontSize: 14, color: "#15803d" }}>Payment link active</span>
              <a href={paymentUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontWeight: 800, fontSize: 13, color: "#15803d", textDecoration: "underline" }}>
                View payment page →
              </a>
            </div>
          </>
        )}

        <Divider />

        {/* ── WORKFLOW ACTIONS ── */}
        <div>
          <SectionLabel>Actions</SectionLabel>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>

            {/* Step 1: PENDING → accept / reject */}
            {status === "pending" && (<>
              <ActionBtn color="#16a34a" hoverColor="#15803d" shadow="rgba(22,163,74,0.22)"
                onClick={() => sendDecision("ACCEPT")} loading={deciding === "ACCEPT"} disabled={deciding !== null}>
                ✓ Accept Order
              </ActionBtn>
              <ActionBtn color="#dc2626" hoverColor="#b91c1c" shadow="rgba(220,38,38,0.18)"
                onClick={() => sendDecision("REJECT")} loading={deciding === "REJECT"} disabled={deciding !== null}>
                ✕ Reject Order
              </ActionBtn>
              {decisionError && <ErrorText>{decisionError}</ErrorText>}
            </>)}

            {/* Step 2: ACCEPTED → waiting for student to pay */}
            {status === "accepted" && (
              <InfoChip bg="#eff6ff" border="#bfdbfe" color="#1e40af">
                ⏳ Waiting for student to complete payment…
              </InfoChip>
            )}

            {/* Step 3: PAYMENT_SUBMITTED → staff confirms payment → PREPARING */}
            {status === "payment_submitted" && (
              <ActionBtn color="#7c3aed" hoverColor="#6d28d9" shadow="rgba(124,58,237,0.20)"
                ring ringColor="rgba(124,58,237,0.30)"
                onClick={confirmPayment}
                loading={actionLoading === "confirm-payment"}
                disabled={actionLoading !== null}>
                💳 Confirm Payment — Start Preparing
              </ActionBtn>
            )}

            {/* Step 4: PREPARING → mark ready */}
            {status === "preparing" && (
              <ActionBtn color="#d97706" hoverColor="#b45309" shadow="rgba(217,119,6,0.20)"
                ring ringColor="rgba(217,119,6,0.30)"
                onClick={markReady}
                loading={actionLoading === "ready"}
                disabled={actionLoading !== null}>
                ✓ Mark as Ready
              </ActionBtn>
            )}

            {actionError && <ErrorText>{actionError}</ErrorText>}

            {/* Terminal states */}
            {status === "ready" && (
              <InfoChip bg="#f0fdf4" border="#86efac" color="#15803d">
                ✓ Ready for pickup — awaiting student
              </InfoChip>
            )}
            {status === "completed" && (
              <InfoChip bg="#f0fdf4" border="#6ee7b7" color="#166534">
                ✓ Order completed and picked up
              </InfoChip>
            )}
            {status === "cancelled" && (
              <InfoChip bg="#fff5f5" border="#fecaca" color="#dc2626">
                ✕ Order rejected
              </InfoChip>
            )}
          </div>
        </div>
      </div>

      {/* Progress tracker */}
      {!["pending", "cancelled"].includes(status) && (
        <div style={{ ...cardStyle, marginTop: 18 }}>
          <SectionLabel>Order Progress</SectionLabel>
          <div style={{ display: "flex", alignItems: "center" }}>
            {WORKFLOW.map((step, i) => {
              const stepIdx = WORKFLOW.indexOf(status);
              const done = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: i < WORKFLOW.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: done ? (current ? "var(--brand)" : "#16a34a") : "#f3f4f6",
                      border: current ? "3px solid var(--brand)" : done ? "3px solid #16a34a" : "2px solid #e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: 13, color: done ? "white" : "#9ca3af",
                      boxShadow: current ? "0 0 0 5px rgba(255,122,0,0.15)" : "none",
                      transition: "all 0.3s",
                    }}>
                      {done && !current ? "✓" : i + 1}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: "capitalize", whiteSpace: "nowrap",
                      color: current ? "var(--brand)" : done ? "#16a34a" : "var(--muted)",
                    }}>
                      {step.replace("_", " ")}
                    </span>
                  </div>
                  {i < WORKFLOW.length - 1 && (
                    <div style={{ flex: 1, height: 3, background: i < WORKFLOW.indexOf(status) ? "#16a34a" : "#e5e7eb", margin: "0 5px", marginBottom: 18, borderRadius: 2, transition: "background 0.3s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}

// ── Shared styles & sub-components ───────────────────────────────────────────
const cardStyle = {
  background: "white", border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 28, padding: "28px 30px",
  boxShadow: "0 18px 45px rgba(90,55,20,0.08)", marginTop: 28,
};
const itemRowStyle = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  background: "var(--bg-soft)", borderRadius: 14, padding: "12px 16px",
};
const qtyBadgeStyle = {
  background: "var(--brand-soft)", color: "var(--brand)",
  borderRadius: 8, padding: "3px 10px", fontWeight: 900, fontSize: 13,
};
const paymentBannerStyle = {
  background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 14,
  padding: "14px 18px", display: "flex", alignItems: "center",
  justifyContent: "space-between", flexWrap: "wrap", gap: 12,
};

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18,
      background: "rgba(255,255,255,0.88)", border: "1px solid rgba(70,45,20,0.10)",
      borderRadius: 12, padding: "9px 18px", fontWeight: 800, fontSize: 14,
      color: "var(--text)", cursor: "pointer",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)", transition: "all 0.2s",
    }}>
      ← Back to orders
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.07)", margin: "22px 0" }} />;
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 800, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
      {children}
    </div>
  );
}

function InfoChip({ bg, border, color, children }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 22px", borderRadius: 16, background: bg, border: `1.5px solid ${border}`, color, fontWeight: 800, fontSize: 15 }}>
      {children}
    </div>
  );
}

function ErrorText({ children }) {
  return <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>{children}</span>;
}

function ActionBtn({ children, onClick, color, hoverColor, shadow, ring = false, ringColor, disabled = false, loading = false }) {
  const off = disabled || loading;
  return (
    <button
      onClick={!off ? onClick : undefined}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "13px 22px", borderRadius: 16, fontWeight: 800, fontSize: 15, color: "white",
        background: off ? "#d1d5db" : color, border: "none",
        boxShadow: off ? "none" : ring ? `0 0 0 5px ${ringColor}, 0 14px 26px ${shadow}` : `0 14px 26px ${shadow}`,
        cursor: off ? "not-allowed" : "pointer",
        transform: ring && !off ? "scale(1.03)" : "scale(1)",
        opacity: off ? 0.6 : 1, transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { if (!off) e.currentTarget.style.background = hoverColor; }}
      onMouseLeave={(e) => { if (!off) e.currentTarget.style.background = color; }}
    >
      {loading && <Spinner />}
      {loading ? "Please wait…" : children}
    </button>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}
