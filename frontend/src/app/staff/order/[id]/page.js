"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout";
import badge from "@/components/badge";

const mockOrderDetails = {
  "142": {
    id: "142",
    student: "Divya Shree",
    registerNo: "RA231100301001",
    items: [
      { name: "Veg Fried Rice", qty: 1, price: 80, note: "Less spicy" },
      { name: "Tea", qty: 1, price: 12, note: "Regular" }
    ],
    slot: "12:15 - 12:30",
    payment: "Awaiting",
    status: "pending"
  },
  "143": {
    id: "143",
    student: "Arun Kumar",
    registerNo: "RA231100301002",
    items: [
      { name: "Chicken Biryani with Egg", qty: 1, price: 150, note: "Standard" }
    ],
    slot: "12:30 - 12:45",
    payment: "Paid",
    status: "accepted"
  },
  "144": {
    id: "144",
    student: "Keerthana",
    registerNo: "RA231100301003",
    items: [
      { name: "Softie", qty: 2, price: 30, note: "Vanilla" },
      { name: "Rose Milk", qty: 1, price: 50, note: "Chilled" }
    ],
    slot: "01:00 - 01:15",
    payment: "Paid",
    status: "preparing"
  },
  "145": {
    id: "145",
    student: "Rahul",
    registerNo: "RA231100301004",
    items: [
      { name: "Masala Dosa", qty: 2, price: 35, note: "Extra chutney" },
      { name: "Coffee", qty: 1, price: 15, note: "Hot" }
    ],
    slot: "01:15 - 01:30",
    payment: "Paid",
    status: "ready"
  }
};

export default function StaffOrderDetailPage() {
  const params = useParams();
  const orderId = params.id;

  const initialOrder = mockOrderDetails[orderId] || {
    id: orderId,
    student: "Unknown Student",
    registerNo: "N/A",
    items: [],
    slot: "N/A",
    payment: "Awaiting",
    status: "pending"
  };

  const [status, setStatus] = useState(initialOrder.status);

  const total = initialOrder.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  return (
    <Layout>
      <div className="orderActions" style={{ marginBottom: "18px" }}>
        <a href="/staff/orders" className="secondaryBtn">← Back to Orders</a>
      </div>

      <div className="detailHeader">
        <div>
          <div className="menuKicker">Staff order view</div>
          <h1 className="sectionHeading" style={{ marginTop: "8px" }}>
            Order #{initialOrder.id}
          </h1>
          <p className="sectionSub">
            Review the order clearly, move it through preparation, and keep pickup on time.
          </p>
        </div>

        <div className="staffbadges">
          <badge status={status} />
          <span className={`paymentbadge ${initialOrder.payment.toLowerCase() === "paid" ? "paid" : "awaiting"}`}>
            {initialOrder.payment.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="detailGrid detailGridRefined">
        <div className="detailMainCard detailMainCardRefined">
          <div className="detailSectionTitle">Student & Pickup Info</div>

          <div className="detailInfoGrid">
            <div className="detailInfoItem">
              <span className="detailLabel">Student Name</span>
              <strong>{initialOrder.student}</strong>
            </div>
            <div className="detailInfoItem">
              <span className="detailLabel">Register No</span>
              <strong>{initialOrder.registerNo}</strong>
            </div>
            <div className="detailInfoItem">
              <span className="detailLabel">Pickup Slot</span>
              <strong>{initialOrder.slot}</strong>
            </div>
            <div className="detailInfoItem">
              <span className="detailLabel">Payment</span>
              <strong>{initialOrder.payment}</strong>
            </div>
          </div>

          <div className="detailSectionTitle" style={{ marginTop: "28px" }}>
            Ordered Items
          </div>

          <div className="detailItemsList">
            {initialOrder.items.map((item, index) => (
              <div key={index} className="detailItemRow">
                <div>
                  <div className="detailItemName">{item.name}</div>
                  <div className="detailItemNote">{item.note}</div>
                </div>

                <div className="detailItemRight">
                  <span className="qtyTag">×{item.qty}</span>
                  <strong>₹{item.price}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="detailSideCard detailSideCardRefined">
          <div className="detailSectionTitle">Quick Actions</div>

          <div className="detailActionStack">
            <button
              className="primarySmallBtn"
              onClick={() => setStatus("accepted")}
            >
              Accept Order
            </button>

            <button
              className="secondaryBtn"
              onClick={() => setStatus("rejected")}
            >
              Reject Order
            </button>

            <button
              className="secondaryBtn"
              onClick={() => setStatus("preparing")}
            >
              Mark as Preparing
            </button>

            <button
              className="secondaryBtn"
              onClick={() => setStatus("ready")}
            >
              Mark as Ready
            </button>
          </div>

          <div className="detailSummaryBox">
            <div className="detailSummaryRow">
              <span>Items Total</span>
              <strong>{initialOrder.items.length}</strong>
            </div>
            <div className="detailSummaryRow">
              <span>Pickup Slot</span>
              <strong>{initialOrder.slot}</strong>
            </div>
            <div className="detailSummaryRow total">
              <span>Total Amount</span>
              <strong>₹{total}</strong>
            </div>
          </div>

          <div className="staffNoteBox">
            Update the status only when the canteen counter is actually ready to move the order forward.
          </div>
        </div>
      </div>
    </Layout>
  );
}