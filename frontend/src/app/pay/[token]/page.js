"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/layout";
import orders from "@/mock/orders.json";

export default function PaymentPage() {
  const params = useParams();
  const token = params.token;

  const order = useMemo(() => {
    return orders.find((item) => item.token === token) || null;
  }, [token]);

  const [secondsLeft, setSecondsLeft] = useState(180);
  const [paymentStatus] = useState(
    order?.payment === "paid" ? "paid" : "awaiting"
  );

  useEffect(() => {
    if (paymentStatus === "paid" || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentStatus, secondsLeft]);

  useEffect(() => {
    if (paymentStatus === "paid" || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      console.log("Checking payment status for token:", token);
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStatus, secondsLeft, token]);

  if (!order) {
    return (
      <Layout>
        <h1 className="sectionHeading">Payment session not found</h1>
        <p className="sectionSub">
          This payment session is unavailable or no longer valid.
        </p>
      </Layout>
    );
  }

  const expired = secondsLeft <= 0 && paymentStatus !== "paid";
  const minutes = String(Math.max(0, Math.floor(secondsLeft / 60))).padStart(2, "0");
  const seconds = String(Math.max(0, secondsLeft % 60)).padStart(2, "0");

  const statusLabel =
    paymentStatus === "paid"
      ? "Payment Confirmed"
      : expired
      ? "Payment Window Expired"
      : "Awaiting Payment Confirmation";

  return (
    <Layout>
      <div className="paymentHero">
        <div className="menuKicker">QR payment</div>
        <h1 className="sectionHeading">Scan & confirm your order</h1>
        <p className="sectionSub">
          Your order is approved. Complete payment through the QR within the active window.
        </p>
      </div>

      <div className="detailGrid">
        <div className="detailMainCard">
          <div className="detailSectionTitle">Order Summary</div>

          <div className="detailItemsList">
            <div className="detailItemRow">
              <div>
                <div className="detailItemName">Order #{order.id}</div>
                <div className="detailItemNote">{order.items}</div>
              </div>
              <div className="detailItemRight">
                <strong>₹{order.total}</strong>
              </div>
            </div>

            <div className="detailItemRow">
              <div>
                <div className="detailItemName">Pickup Slot</div>
                <div className="detailItemNote">{order.slot}</div>
              </div>
              <div className="detailItemRight">
                <span className="slotChip">{order.slot}</span>
              </div>
            </div>

            <div className="detailItemRow">
              <div>
                <div className="detailItemName">Canteen</div>
                <div className="detailItemNote">{order.canteen}</div>
              </div>
              <div className="detailItemRight">
                <span className="amountChip">₹{order.total}</span>
              </div>
            </div>
          </div>

          <div className="detailSummaryBox" style={{ marginTop: "20px" }}>
            <div className="detailSummaryRow">
              <span>Payment Mode</span>
              <strong>QR Payment</strong>
            </div>
            <div className="detailSummaryRow">
              <span>Order Amount</span>
              <strong>₹{order.total}</strong>
            </div>
            <div className="detailSummaryRow total">
              <span>Current State</span>
              <strong>{statusLabel}</strong>
            </div>
          </div>
        </div>

        <div className="detailSideCard">
          <div className="detailSectionTitle">Payment Window</div>

          <div
            style={{
              fontSize: "44px",
              fontWeight: "900",
              marginBottom: "12px",
              color: expired ? "#e03b3b" : paymentStatus === "paid" ? "#128c5a" : "#1f2437"
            }}
          >
            {paymentStatus === "paid" ? "PAID" : `${minutes}:${seconds}`}
          </div>

          <p className="sectionSub" style={{ marginTop: 0, fontSize: "16px", maxWidth: "none" }}>
            {paymentStatus === "paid"
              ? "Payment has been verified successfully. Your order continues to the next stage."
              : expired
              ? "This QR session has expired. Payment is no longer valid for this order."
              : "Scan using any UPI app. Status will refresh automatically after verification."}
          </p>

          <div className="qrBox qrBoxRefined">
            {paymentStatus === "paid" ? (
              <div className="qrPaidState">
                <div className="qrPaidIcon">✓</div>
                <div className="qrPaidText">Payment Confirmed</div>
              </div>
            ) : expired ? (
              <div className="qrExpiredState">
                <div className="qrPaidIcon">✕</div>
                <div className="qrPaidText">QR Expired</div>
              </div>
            ) : (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=SIST-SMART-CANTEEN-${order.token}-AMOUNT-${order.total}`}
                alt="QR Code"
                className="qrImage qrImageRefined"
              />
            )}
          </div>

          <div className="upiHintBox">
            <div className="upiHintTitle">Scan with</div>
            <div className="upiHintList">
              Google Pay • PhonePe • Paytm • BHIM UPI
            </div>
          </div>

          <div className="detailActionStack" style={{ marginTop: "18px" }}>
            <button
              className="secondaryBtn"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </button>

            <a href="/orders" className="secondaryBtn">
              Back to Orders
            </a>
          </div>

          <div className="paymentNoteBox">
            This page is designed for automatic payment verification. In the full
            system, backend payment status checks or gateway webhooks will update
            your order without manual confirmation.
          </div>
        </div>
      </div>
    </Layout>
  );
}