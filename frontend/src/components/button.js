"use client";

const variants = {
  primary: {
    background: "linear-gradient(90deg, #ff6200 0%, #ff8f1f 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 16px rgba(255,98,0,0.28)",
    "--hover-bg": "linear-gradient(90deg, #e55700 0%, #f07d10 100%)",
    "--hover-shadow": "0 8px 24px rgba(255,98,0,0.36)",
  },
  ghost: {
    background: "rgba(255,255,255,0.92)",
    color: "#1a1d2e",
    border: "1.5px solid rgba(0,0,0,0.10)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    "--hover-bg": "rgba(255,255,255,1)",
    "--hover-shadow": "0 6px 18px rgba(0,0,0,0.10)",
  },
  success: {
    background: "linear-gradient(90deg, #16a34a 0%, #22c55e 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 16px rgba(22,163,74,0.28)",
    "--hover-bg": "linear-gradient(90deg, #15803d 0%, #16a34a 100%)",
    "--hover-shadow": "0 8px 24px rgba(22,163,74,0.36)",
  },
  danger: {
    background: "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 16px rgba(220,38,38,0.24)",
    "--hover-bg": "linear-gradient(90deg, #b91c1c 0%, #dc2626 100%)",
    "--hover-shadow": "0 8px 24px rgba(220,38,38,0.32)",
  },
};

export default function Button({
  children,
  variant = "primary",
  full = false,
  disabled = false,
  loading = false,
  ...props
}) {
  const v = variants[variant] ?? variants.primary;
  const inactive = disabled || loading;

  function handleMouseEnter(e) {
    if (inactive) return;
    e.currentTarget.style.transform = "translateY(-2px)";
    e.currentTarget.style.boxShadow = v["--hover-shadow"] ?? v.boxShadow;
  }

  function handleMouseLeave(e) {
    if (inactive) return;
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = v.boxShadow;
  }

  return (
    <button
      {...props}
      disabled={inactive}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: full ? "100%" : "auto",
        padding: "13px 22px",
        borderRadius: 16,
        fontWeight: 800,
        fontSize: 15,
        cursor: inactive ? "not-allowed" : "pointer",
        opacity: inactive ? 0.6 : 1,
        transition: "transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms cubic-bezier(0.16,1,0.3,1)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: v.background,
        color: v.color,
        border: v.border ?? "none",
        boxShadow: inactive ? "none" : v.boxShadow,
      }}
    >
      {loading && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {loading ? "Please wait…" : children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
