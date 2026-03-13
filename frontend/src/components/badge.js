export default function Badge({ status }) {
  const normalized = String(status || "pending").toLowerCase();

  const labelMap = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    approved: "APPROVED",
    preparing: "PREPARING",
    ready: "READY",
    rejected: "REJECTED",
  };

  return (
    <span className={`badge ${normalized}`}>
      {labelMap[normalized] || normalized.toUpperCase()}
    </span>
  );
}