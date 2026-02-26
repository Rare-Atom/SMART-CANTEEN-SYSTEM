export default function Home() {
  return (
    <div style={{ padding: 20 }}>
      <h1>SIST Smart Canteen</h1>
      <p>Skip the queue, Savour the meal</p>
      <ul>
        <li><a href="/login">Student Login</a></li>
        <li><a href="/menu">Menu</a></li>
        <li><a href="/checkout">Checkout</a></li>
        <li><a href="/orders">My Orders</a></li>
        <li><a href="/pay/demoToken123">Payment</a></li>
        <li><a href="/staff/orders">Staff Orders</a></li>
      </ul>
    </div>
  );
}