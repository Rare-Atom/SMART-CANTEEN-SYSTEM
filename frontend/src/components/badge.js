// Status badge — maps order lifecycle statuses to labels and colours.
// Inline styles are used so the badge is self-contained regardless of CSS order.

const BADGE_MAP = {
  pending:           { label: "Pending",           bg: "#fffbeb", color: "#92400e", border: "#fde68a" },
  accepted:          { label: "Accepted",           bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  payment_submitted: { label: "Payment Submitted",  bg: "#faf5ff", color: "#6d28d9", border: "#ddd6fe" },
  preparing:         { label: "Preparing",          bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
  ready:             { label: "Ready for Pickup",   bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  completed:         { label: "Completed",          bg: "#ecfdf5", color: "#166534", border: "#6ee7b7" },
  cancelled:         { label: "Cancelled",          bg: "#fff5f5", color: "#dc2626", border: "#fecaca" },
  // Legacy aliases
  paid:              { label: "Paid",               bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  approved:          { label: "Approved",           bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  rejected:          { label: "Rejected",           bg: "#fff5f5", color: "#dc2626", border: "#fecaca" },
};

const FALLBACK = { label: null, bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };

export default function Badge({ status }) {
  const key = String(status || "pending").toLowerCase();
  const { label, bg, color, border } = BADGE_MAP[key] ?? FALLBACK;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 800,
      letterSpacing: "0.03em",
      background: bg,
      color,
      border: `1.5px solid ${border}`,
      whiteSpace: "nowrap",
    }}>
      {label ?? key}
    </span>
  );
}
