const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        // "drinks" items are displayed under Snacks & Drinks in the UI
        enum: ["veg", "nonveg", "snacks", "drinks"],
        required: true
    },
    image: {
        type: String
    },
    // Master availability switch — when false, item is hidden everywhere
    available: {
        type: Boolean,
        default: true
    },
    // Which canteen(s) serve this item
    canteen: {
        type: String,
        enum: ["MAIN", "SCAS", "BOTH"],
        default: "BOTH"
    },
    // Per-canteen availability — staff can toggle each independently
    availableAt: {
        MAIN: { type: Boolean, default: true },
        SCAS: { type: Boolean, default: true }
    }
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
