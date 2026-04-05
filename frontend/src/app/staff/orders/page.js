"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";
import Badge from "@/components/badge";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function normalise(o) {
  return {
    id:        o._id,
    student:   o.student && typeof o.student === "object" ? o.student.name ?? "Student" : "Student",
    items:     Array.isArray(o.items) ? o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ") : "—",
    slot:      o.slot || "—",
    canteen:   o.canteen || "—",
    status:    (o.status ?? "PENDING").toLowerCase(),
    total:     o.totalAmount ?? 0,
    createdAt: o.createdAt ?? null,
  };
}

const FILTER_OPTIONS = [
  { key: "all",               label: "All Orders" },
  { key: "pending",           label: "Pending Review" },
  { key: "payment_submitted", label: "Confirm Payment" },
  { key: "preparing",         label: "Preparing" },
  { key: "ready",             label: "Ready" },
];

const URGENT = new Set(["payment_submitted"]);

export default function StaffOrdersPage() {
  const router = useRouter();
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastRefreshed,setLastRefreshed]= useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const mountedRef     = useRef(true);
  const intervalCtrl   = useRef(null); // AbortController for the current interval tick

  useEffect(() => {
    const u = getUser();
    if (!u)               { router.replace("/login?next=/staff/orders"); return; }
    if (u.role !== "staff") { router.replace("/orders"); }
  }, [router]);

  const fetchOrders = useCallback(async (signal) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/staff/orders`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      if (!mountedRef.current) return;
      // Backend already returns newest-first (createdAt: -1)
      const normalised = Array.isArray(data) ? data.map(normalise) : [];
      setOrders(normalised);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      if (err.name === "AbortError") return;
      if (mountedRef.current) setError(err.message ?? "Failed to load orders");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    const initCtrl = new AbortController();
    fetchOrders(initCtrl.signal);

    // Auto-refresh every 20 s — abort the previous tick's request before starting a new one
    const iv = setInterval(() => {
      if (intervalCtrl.current) intervalCtrl.current.abort();
      intervalCtrl.current = new AbortController();
      fetchOrders(intervalCtrl.current.signal);
    }, 20_000);

    return () => {
      mountedRef.current = false;
      initCtrl.abort();
      if (intervalCtrl.current) intervalCtrl.current.abort();
      clearInterval(iv);
    };
  }, [fetchOrders]);

  function refresh() {
    setLoading(true);
    if (intervalCtrl.current) intervalCtrl.current.abort();
    intervalCtrl.current = new AbortController();
    fetchOrders(intervalCtrl.current.signal);
  }

  // ── Counts for stat cards ─────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:             orders.length,
    pending:           orders.filter((o) => o.status === "pending").length,
    payment_submitted: orders.filter((o) => o.status === "payment_submitted").length,
    preparing:         orders.filter((o) => o.status === "preparing").length,
    ready:             orders.filter((o) => o.status === "ready").length,
  }), [orders]);

  // ── Filtered list — newest first (backend order preserved) ─────────────────
  const visibleOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  return (
    <Layout>
      <div className="staffHero">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="menuKicker">Staff panel</div>
            <h1 className="sectionHeading">Counter Control</h1>
            <p className="sectionSub">Manage incoming orders, confirm payments, and track kitchen progress.</p>
          </div>
          <button onClick={refresh} style={refreshBtnStyle}>↻ Refresh</button>
        </div>
        {lastRefreshed && !loading && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6, fontWeight: 600 }}>
            Updated {lastRefreshed.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="staffStatsGrid staffStatsGridRefined">
        {[
          { key: "all",               label: "Total",           value: counts.total,             hint: "All orders",                         urgent: false },
          { key: "pending",           label: "Pending Review",  value: counts.pending,           hint: "Awaiting accept / reject",           urgent: false },
          { key: "payment_submitted", label: "Confirm Payment", value: counts.payment_submitted, hint: "Student paid — needs confirmation",  urgent: counts.payment_submitted > 0 },
          { key: "preparing",         label: "Preparing",       value: counts.preparing,         hint: "In the kitchen",                     urgent: false },
          { key: "ready",             label: "Ready",           value: counts.ready,             hint: "Waiting for pickup",                 urgent: false },
        ].map(({ key, label, value, hint, urgent }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className="staffStatCard staffStatCardRefined"
            style={{
              cursor: "pointer", textAlign: "left", border: "none",
              ...(activeFilter === key
                ? { border: "2px solid var(--brand)", background: "var(--brand-soft)" }
                : urgent
                ? { border: "2px solid #7c3aed", background: "#faf5ff" }
                : {}),
            }}
          >
            <div className="staffStatLabel" style={
              activeFilter === key ? { color: "var(--brand)" }
              : urgent           ? { color: "#7c3aed" }
              : {}
            }>
              {label}
              {activeFilter === key && <span style={{ marginLeft: 6, fontSize: 10 }}>▼</span>}
            </div>
            <div className="staffStatValue" style={
              activeFilter === key ? { color: "var(--brand)" }
              : urgent           ? { color: "#7c3aed" }
              : {}
            }>
              {loading ? "—" : value}
            </div>
            <div className="staffStatHint">{hint}</div>
          </button>
        ))}
      </div>

      {/* ── Filter chips ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 24, marginBottom: 4 }}>
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`filterChip ${activeFilter === key ? "active" : ""}`}
            style={key === "payment_submitted" && counts.payment_submitted > 0 && activeFilter !== key
              ? { borderColor: "#7c3aed", color: "#7c3aed" }
              : {}}
          >
            {label}
            {key !== "all" && !loading && (
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 900,
                background: activeFilter === key ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.07)",
                borderRadius: 999, padding: "1px 6px",
              }}>
                {counts[key] ?? 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading skeletons ── */}
      {loading && (
        <div style={{ marginTop: 24, display: "grid", gap: 18 }}>
          {[1, 2, 3].map((n) => (
            <div key={n} style={{ background: "white", border: "1px solid rgba(0,0,0,0.07)", borderRadius: 22, padding: "22px", boxShadow: "0 10px 28px rgba(90,55,20,0.06)", animation: "pulse 1.4s ease-in-out infinite" }}>
              <div style={{ height: 22, width: "40%", borderRadius: 8, background: "#f3f4f6", marginBottom: 12 }} />
              <div style={{ height: 16, width: "60%", borderRadius: 8, background: "#f3f4f6" }} />
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div style={{ marginTop: 24, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 18, padding: "22px 24px", color: "#dc2626", fontWeight: 700 }}>
          {error} —{" "}
          <button onClick={refresh} style={{ background: "none", border: "none", color: "#dc2626", textDecoration: "underline", cursor: "pointer", fontWeight: 700 }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && visibleOrders.length === 0 && (
        <div style={{ marginTop: 32, textAlign: "center", padding: "56px 24px", color: "var(--muted)", fontWeight: 700, fontSize: 17 }}>
          {activeFilter === "all"
            ? "No active orders. New orders appear automatically."
            : `No orders with status "${FILTER_OPTIONS.find(f => f.key === activeFilter)?.label}".`}
        </div>
      )}

      {/* ── Order grid ── */}
      {!loading && !error && visibleOrders.length > 0 && (
        <div className="staffOrderGrid staffOrderGridRefined">
          {visibleOrders.map((order) => {
            const isUrgent = URGENT.has(order.status);
            return (
              <a
                key={order.id}
                href={`/staff/order/${order.id}`}
                className="staffOrderCard staffOrderCardRefined"
                style={isUrgent ? { borderColor: "#7c3aed", borderWidth: 2, background: "#faf5ff" } : undefined}
              >
                {/* Urgent banner */}
                {isUrgent && (
                  <div style={{ marginBottom: 10, background: "#7c3aed", color: "white", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 800, display: "inline-block" }}>
                    ⚡ Payment Submitted — Confirm Now
                  </div>
                )}

                <div className="staffOrderTop">
                  <div>
                    <div className="staffOrderId">#{order.id.slice(-6).toUpperCase()}</div>
                    <div className="staffStudentName">{order.student}</div>
                  </div>
                  <div className="staffbadges">
                    <Badge status={order.status} />
                    <span style={{
                      padding: "3px 8px", borderRadius: 8, fontSize: 11, fontWeight: 800,
                      background: order.canteen === "MAIN" ? "#fff7ed" : "#eff6ff",
                      color:      order.canteen === "MAIN" ? "#c2410c" : "#1e40af",
                    }}>
                      {order.canteen}
                    </span>
                  </div>
                </div>

                <div className="staffOrderItems">{order.items}</div>

                <div className="staffMetaRow">
                  <span className="slotChip">{order.slot}</span>
                  <span className="amountChip">₹{order.total}</span>
                </div>

                <div className="staffOrderFooter">
                  <span className="viewLinkText">Open order →</span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

const refreshBtnStyle = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "9px 16px", borderRadius: 12, fontWeight: 800, fontSize: 13,
  cursor: "pointer", border: "1.5px solid rgba(70,45,20,0.12)",
  background: "rgba(255,255,255,0.88)", color: "var(--text)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)", transition: "all 0.18s",
};
