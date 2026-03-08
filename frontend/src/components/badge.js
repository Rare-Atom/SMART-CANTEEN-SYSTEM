"use client";

export default function Badge({ status = "PENDING" }) {
  const map = {
    PENDING: { bg: "rgba(245,158,11,0.16)", br: "rgba(245,158,11,0.4)", tx: "#f59e0b" },
    ACCEPTED: { bg: "rgba(34,197,94,0.16)", br: "rgba(34,197,94,0.4)", tx: "#22c55e" },
    REJECTED: { bg: "rgba(239,68,68,0.16)", br: "rgba(239,68,68,0.4)", tx: "#ef4444" },
    PAY_PENDING: { bg: "rgba(255,183,3,0.16)", br: "rgba(255,183,3,0.4)", tx: "#ffb703" },
    PAID: { bg: "rgba(34,197,94,0.16)", br: "rgba(34,197,94,0.4)", tx: "#22c55e" },
    PREPARING: { bg: "rgba(59,130,246,0.16)", br: "rgba(59,130,246,0.4)", tx: "#3b82f6" },
    READY: { bg: "rgba(16,185,129,0.16)", br: "rgba(16,185,129,0.4)", tx: "#10b981" },
    EXPIRED: { bg: "rgba(148,163,184,0.16)", br: "rgba(148,163,184,0.35)", tx: "#94a3b8" },
  };

  const s = map[status] || map.PENDING;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${s.br}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 800,
        fontSize: 12,
        textTransform: "uppercase",
      }}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}