"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const order = {
    id: orderId,
    student: "Divya Shree",
    items: [
      { name: "Veg Fried Rice", qty: 1 },
      { name: "Tea", qty: 1 },
    ],
    slot: "12:15 - 12:30",
  };

  // status: "Pending" | "Accepted" | "Rejected" | "Preparing" | "Ready"
  const [status, setStatus] = useState("Pending");

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/staff/orders")}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Back
      </button>

      <h1 className="text-2xl font-bold mb-3">Order #{order.id}</h1>

      <p>
        <strong>Student:</strong> {order.student}
      </p>

      <h3 className="mt-4 font-semibold">Items:</h3>
      {order.items.map((item, index) => (
        <p key={index}>
          {item.name} ×{item.qty}
        </p>
      ))}

      <p className="mt-3">
        <strong>Slot:</strong> {order.slot}
      </p>

      <p className="mt-3 text-lg font-bold">Status: {status}</p>

      <div className="flex gap-3 mt-6">
        {/* Show Accept / Reject only when status is Pending */}
        {status === "Pending" && (
          <>
            <button
              onClick={() => setStatus("Accepted")}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Accept
            </button>

            <button
              onClick={() => setStatus("Rejected")}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </>
        )}

        {/* Show workflow buttons only after order is Accepted */}
        {status !== "Pending" && status !== "Rejected" && (
          <>
            {/* Preparing — highlighted (ring + scale) when status is Accepted */}
            <button
              onClick={() => setStatus("Preparing")}
              className={`px-4 py-2 rounded text-white transition-all duration-200
                ${
                  status === "Accepted"
                    ? "bg-yellow-500 ring-4 ring-yellow-300 scale-105 font-bold shadow-lg"
                    : "bg-yellow-500"
                }`}
            >
              Preparing
            </button>

            <button
              onClick={() => setStatus("Ready")}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Ready
            </button>
          </>
        )}

        {/* Show a reset button when Rejected so staff can undo */}
        {status === "Rejected" && (
          <button
            onClick={() => setStatus("Pending")}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Undo Reject
          </button>
        )}
      </div>
    </div>
  );
}