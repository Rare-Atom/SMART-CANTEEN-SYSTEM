"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout";
import menuData from "@/mock/menu.json";
import slotsData from "@/mock/slots.json";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedCanteen, setSelectedCanteen] = useState("Main Canteen");

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const savedCanteen =
      localStorage.getItem("selectedCanteen") || "Main Canteen";

    const enrichedCart = savedCart
      .map((cartItem) => {
        const fullItem = menuData.find((item) => item.id === cartItem.id);
        if (!fullItem) return null;

        return {
          ...fullItem,
          qty: cartItem.qty || 1,
        };
      })
      .filter(Boolean);

    setCart(enrichedCart);
    setSelectedCanteen(savedCanteen);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const platformFee = cart.length > 0 ? 5 : 0;
  const total = subtotal + platformFee;

  const updateQty = (id, type) => {
    const updatedCart = cart
      .map((item) => {
        if (item.id !== id) return item;

        const newQty = type === "inc" ? item.qty + 1 : item.qty - 1;
        return { ...item, qty: newQty };
      })
      .filter((item) => item.qty > 0);

    setCart(updatedCart);

    const localCart = updatedCart.map((item) => ({
      id: item.id,
      qty: item.qty,
    }));

    localStorage.setItem("cart", JSON.stringify(localCart));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!selectedSlot) {
      alert("Please select a pickup slot.");
      return;
    }

    const newOrder = {
      id: Date.now(),
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      canteen: selectedCanteen,
      slot: selectedSlot,
      subtotal,
      platformFee,
      total,
      status: "pending",
      paymentStatus: "awaiting",
      createdAt: new Date().toISOString(),
    };

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const updatedOrders = [newOrder, ...existingOrders];

    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    localStorage.removeItem("cart");

    router.push("/orders");
  };

  return (
    <Layout>
      <div className="pageWrap">
        <div className="menuKicker">Checkout</div>
        <h1 className="sectionHeading">Review your order</h1>
        <p className="sectionSub">
          Confirm your items, choose a pickup slot, and place your order in one
          smooth step.
        </p>

        <div className="detailGrid" style={{ marginTop: "28px" }}>
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
                  <div className="detailItemRow" key={item.id}>
                    <div>
                      <div className="detailItemName">{item.name}</div>
                      <div className="detailItemNote">{item.description}</div>
                    </div>

                    <div className="detailItemRight">
                      <button
                        className="secondaryBtn"
                        onClick={() => updateQty(item.id, "dec")}
                      >
                        -
                      </button>

                      <span className="qtyTag">{item.qty}</span>

                      <button
                        className="secondaryBtn"
                        onClick={() => updateQty(item.id, "inc")}
                      >
                        +
                      </button>

                      <span className="foodPrice">₹{item.price * item.qty}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="detailSideCard">
            <div className="detailSectionTitle">Order summary</div>

            <div className="detailInfoGrid">
              <div className="detailInfoItem">
                <span className="detailLabel">Canteen</span>
                <strong>{selectedCanteen}</strong>
              </div>

              <div className="detailInfoItem">
                <span className="detailLabel">Items</span>
                <strong>{cart.length}</strong>
              </div>
            </div>

            <div style={{ marginTop: "22px" }}>
              <div className="detailSectionTitle" style={{ fontSize: "18px" }}>
                Pickup slot
              </div>

              <div className="searchRow">
                {slotsData.map((slot) => (
                  <button
                    key={slot.id}
                    className={`filterChip ${
                      selectedSlot === slot.time ? "active" : ""
                    }`}
                    onClick={() => setSelectedSlot(slot.time)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>

            <div className="detailSummaryBox">
              <div className="detailSummaryRow">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="detailSummaryRow">
                <span>Platform fee</span>
                <strong>₹{platformFee}</strong>
              </div>

              <div className="detailSummaryRow total">
                <span>Total</span>
                <strong>₹{total}</strong>
              </div>
            </div>

            <div className="detailActionStack" style={{ marginTop: "18px" }}>
              <button className="authButton" onClick={handlePlaceOrder}>
                Place Order
              </button>

              <button
                className="secondaryBtn"
                onClick={() => router.push("/menu")}
              >
                Back to Menu
              </button>
            </div>

            <div className="paymentNoteBox">
              Orders move for staff approval first. Once approved, payment opens
              for the selected pickup slot window.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}