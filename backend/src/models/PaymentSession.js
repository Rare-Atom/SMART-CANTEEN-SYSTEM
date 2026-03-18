const mongoose = require("mongoose");

const paymentSessionSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },

    token: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true
    },

    paid: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("PaymentSession", paymentSessionSchema);