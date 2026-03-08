export default function Layout({ title, children }) {
  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <h1>SIST Smart Canteen</h1>
          <p>Skip the queue, Savour the meal</p>
        </div>

        <div className="nav">
          <a className="pill" href="/">Home</a>
          <a className="pill" href="/menu">Menu</a>
          <a className="pill" href="/orders">Orders</a>
          <a className="pill" href="/staff/orders">Staff</a>
        </div>
      </div>

      {title ? <div className="pageTitle">{title}</div> : <div style={{ height: 16 }} />}
      {children}
    </div>
  );
}