export default function Card({ children }) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 12 }}>
      {children}
    </div>
  );
}