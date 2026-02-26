export default function Layout({ title, children }) {
  return (
    <div style={{ maxWidth: 950, margin: "0 auto", padding: 16 }}>
      <header style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>SIST Smart Canteen</h1>
        <p style={{ margin: "4px 0 0" }}>Skip the queue, Savour the meal</p>
      </header>
      <hr />
      <h2 style={{ marginTop: 12 }}>{title}</h2>
      {children}
    </div>
  );
}