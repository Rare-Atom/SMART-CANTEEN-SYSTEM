"use client";

export default function Card({ children, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(70,45,20,0.08)",
        borderRadius: 24,
        padding: 18,
        boxShadow: "0 18px 45px rgba(90, 55, 20, 0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}