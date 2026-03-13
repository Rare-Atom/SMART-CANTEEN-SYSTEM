const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    items: Array,
    status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "PREPARING", "READY", "PAID", "CANCELLED"],
        default: "PENDING"
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", schema);