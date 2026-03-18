"use client";

export default function Button({
  children,
  variant = "primary",
  full = false,
  ...props
}) {
  const styles = {
    primary: {
      background: "linear-gradient(90deg, #ff7a00, #ffb300)",
      color: "#fff",
      border: "none",
      boxShadow: "0 14px 26px rgba(255,122,0,0.22)",
    },
    ghost: {
      background: "rgba(255,255,255,0.86)",
      color: "#2f241d",
      border: "1px solid rgba(70,45,20,0.08)",
      boxShadow: "0 10px 20px rgba(90, 55, 20, 0.05)",
    },
  };

  return (
    <button
      {...props}
      style={{
        width: full ? "100%" : "auto",
        padding: "13px 18px",
        borderRadius: 16,
        fontWeight: 800,
        fontSize: 15,
        cursor: "pointer",
        transition: "0.2s ease",
        ...styles[variant],
      }}
    >
      {children}
    </button>
  );
}