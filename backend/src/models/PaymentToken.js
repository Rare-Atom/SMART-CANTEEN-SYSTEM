const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    orderId: mongoose.Schema.Types.ObjectId,
    token: String,
    expiresAt: Date
});

module.exports = mongoose.model("PaymentToken", schema);