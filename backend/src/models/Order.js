const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: false
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (arr) => arr.length > 0,
            message: "Order must contain at least one item"
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // Stored as a plain time string (e.g. "12:30 PM") — no Slot ObjectId needed
    slot: {
        type: String
    },
    // Set when staff accepts the order; used to generate the /pay/:token URL
    paymentToken: {
        type: String
    },
    // Which canteen this order was placed at
    canteen: {
        type: String,
        enum: ["MAIN", "SCAS"],
        default: "MAIN"
    },
    status: {
        type: String,
        enum: [
            "PENDING",            // student placed order
            "ACCEPTED",           // staff accepted, payment link generated
            "PAYMENT_SUBMITTED",  // student marked payment done — awaits staff confirmation
            "PREPARING",          // staff confirmed payment, kitchen is cooking
            "READY",              // staff marked ready for pickup
            "COMPLETED",          // student confirmed pickup
            "CANCELLED"           // staff rejected
        ],
        default: "PENDING"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
