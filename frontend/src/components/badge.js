export default function Badge({ text }) {
  return (
    <span style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid #ccc" }}>
      {text}
    </span>
  );
}