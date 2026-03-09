export default function Layout({ children }) {
  return (
    <div className="appShell">
      <div className="topBarWhite">
        <div className="leftGroup">
          <div className="brandLogo">S</div>
          <div>
            <div className="brandMini">SIST Smart Canteen</div>
            <div style={{ color: "#686b78", fontSize: 14 }}>
              Fresh picks. Faster pickup.
            </div>
          </div>
        </div>

        <div className="navMini">
          <a href="/">Home</a>
          <a href="/menu">Menu</a>
          <a href="/orders">Orders</a>
          <a href="/staff/orders">Staff</a>
        </div>
      </div>

      <div className="pageWrap">{children}</div>
    </div>
  );
}