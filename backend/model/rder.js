const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
{
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MenuItem"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],

    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Slot",
        required: true
    },

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "PREPARING",
            "READY",
            "PAID",
            "CANCELLED"
        ],
        default: "PENDING"
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
