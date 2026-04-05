"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";
import { getToken, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const CANTEEN_KEY = "selectedCanteen";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [canteen, setCanteen] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const mountedRef = useRef(true);

  // Redirect staff away
  useEffect(() => {
    const u = getUser();
    if (u?.role === "staff") router.replace("/staff/orders");
  }, [router]);

  // Load cart + canteen from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(savedCart);
    } catch { setCart([]); }
    const savedCanteen = localStorage.getItem(CANTEEN_KEY);
    setCanteen(savedCanteen || null);
  }, []);

  // Fetch pickup slots (single request, no polling)
  useEffect(() => {
    mountedRef.current = true;
    const ctrl = new AbortController();
    fetch(`${API_BASE}/api/slots`, { signal: ctrl.signal })
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { if (mountedRef.current) setSlots(Array.isArray(d) ? d : []); })
      .catch(() => {});
    return () => { mountedRef.current = false; ctrl.abort(); };
  }, []);

  // Total = exact item prices — no platform fee
  const total = useMemo(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  function updateQty(id, type) {
    const updated = cart
      .map((item) => item._id !== id ? item : { ...item, qty: type === "inc" ? item.qty + 1 : item.qty - 1 })
      .filter((item) => item.qty > 0);
    setCart(updated);
    try {
      localStorage.setItem("cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
    } catch { /* ignore */ }
  }

  async function handlePlaceOrder() {
    setError("");

    if (cart.length === 0)  { setError("Your cart is empty."); return; }
    if (!selectedSlot)      { setError("Please select a pickup slot."); return; }
    if (!canteen)           { setError("Canteen not selected. Go back to the menu and choose a canteen."); return; }

    const token = getToken();
    if (!token) { router.push("/login?next=/checkout"); return; }

    setPlacing(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
          totalAmount: total,
          slot: selectedSlot,
          canteen,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to place order."); return; }

      try {
        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));
      } catch { /* ignore */ }
      router.push("/orders");
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      if (mountedRef.current) setPlacing(false);
    }
  }

  return (
    <Layout>
      <div className="pageWrap">
        <div className="menuKicker">Checkout</div>
        <h1 className="sectionHeading">Review your order</h1>
        <p className="sectionSub">Confirm your items, choose a pickup slot, and place your order.</p>

        <div className="detailGrid" style={{ marginTop: 28 }}>
          {/* Left: items */}
          <div className="detailMainCard">
            <div className="detailSectionTitle">Your items</div>
            {cart.length === 0 ? (
              <div className="emptyState">
                <h3>Your cart is empty</h3>
                <p>Add items from the menu to continue.</p>
              </div>
            ) : (
              <div className="detailItemsList">
                {cart.map((item) => (
                  <div className="detailItemRow" key={item._id}>
                    <div className="detailItemName">{item.name}</div>
                    <div className="detailItemRight">
                      <button className="secondaryBtn" onClick={() => updateQty(item._id, "dec")}>−</button>
                      <span className="qtyTag">{item.qty}</span>
                      <button className="secondaryBtn" onClick={() => updateQty(item._id, "inc")}>+</button>
                      <span className="foodPrice">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: summary + slot + action */}
          <div className="detailSideCard">
            <div className="detailSectionTitle">Order summary</div>

            {/* Canteen indicator */}
            {canteen ? (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 16,
                background: canteen === "MAIN" ? "#fff7ed" : "#eff6ff",
                border: `1.5px solid ${canteen === "MAIN" ? "#fdba74" : "#bfdbfe"}`,
                borderRadius: 12, padding: "10px 14px",
              }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: canteen === "MAIN" ? "#c2410c" : "#1e40af" }}>
                  {canteen === "MAIN" ? "🍽️" : "☕"} {canteen} Canteen
                </span>
                <a href="/menu" style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", textDecoration: "underline" }}>Change</a>
              </div>
            ) : (
              <div style={{ marginBottom: 14, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "#dc2626" }}>
                No canteen selected —{" "}
                <a href="/menu" style={{ textDecoration: "underline" }}>choose one on the menu page</a>
              </div>
            )}

            {/* Slot picker */}
            <div style={{ marginBottom: 18 }}>
              <div className="detailSectionTitle" style={{ fontSize: 16 }}>Pickup slot</div>
              <div className="searchRow" style={{ marginTop: 10 }}>
                {slots.length === 0 && (
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>Loading slots…</span>
                )}
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    className={`filterChip ${selectedSlot === slot.time ? "active" : ""}`}
                    onClick={() => setSelectedSlot(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            {/* Price summary — no platform fee */}
            <div className="detailSummaryBox">
              <div className="detailSummaryRow total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
            </div>

            {error && (
              <div style={{ marginTop: 14, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "11px 14px", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
                {error}
              </div>
            )}

            <div className="detailActionStack" style={{ marginTop: 18 }}>
              <button
                className="authButton"
                onClick={handlePlaceOrder}
                disabled={placing}
                style={{ opacity: placing ? 0.7 : 1, cursor: placing ? "not-allowed" : "pointer" }}
              >
                {placing ? "Placing order…" : "Place Order"}
              </button>
              <button className="secondaryBtn" onClick={() => router.push("/menu")}>
                Back to Menu
              </button>
            </div>

            <div className="paymentNoteBox">
              Orders go to staff for approval first. Once accepted you will receive a payment link.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
