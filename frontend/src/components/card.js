"use client";

const variants = {
  default: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
    borderRadius: 22,
    padding: 24,
  },
  elevated: {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.09), 0 3px 8px rgba(0,0,0,0.05)",
    borderRadius: 24,
    padding: 28,
  },
  soft: {
    background: "rgba(255,248,243,0.90)",
    border: "1px solid rgba(255,98,0,0.08)",
    boxShadow: "0 4px 16px rgba(255,98,0,0.06)",
    borderRadius: 20,
    padding: 22,
  },
  glass: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid rgba(255,255,255,0.60)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    borderRadius: 24,
    padding: 24,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
};

export default function Card({ children, className = "", variant = "default", style = {} }) {
  const v = variants[variant] ?? variants.default;

  return (
    <div
      className={className}
      style={{ ...v, ...style }}
    >
      {children}
    </div>
  );
}
