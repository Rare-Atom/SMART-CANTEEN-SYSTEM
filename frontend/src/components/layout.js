export default function Layout({ children }) {
  return (
    <div className="appShell">
      <header className="topBarWhite">
        <div className="leftGroup">
          <div className="brandLogo">S</div>
          <div>
            <div className="brandMini">SIST Smart Canteen</div>
            <div className="brandMiniSub">Skip the queue, Savour the meal</div>
          </div>
        </div>

        <nav className="navMini">
          <a href="/">Home</a>
          <a href="/menu">Menu</a>
          <a href="/orders">Orders</a>
          <a href="/staff/orders">Staff</a>
        </nav>
      </header>

      <main className="pageWrap">{children}</main>
    </div>
  );
}