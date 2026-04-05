const Order = require("../models/Order");

// GET /api/pay/verify/:token  (public — anyone with the link can check status)
// Looks up the order directly via its paymentToken field.
// Returns order state so the payment page can render correctly for any status.
exports.verifyToken = async (req, res, next) => {
    try {
        const order = await Order.findOne({ paymentToken: req.params.token }).lean();

        if (!order) {
            return res.status(404).json({ message: "Invalid payment link" });
        }

        // Token is only meaningful while the order is in a payment-related state
        const activeStatuses = ["ACCEPTED", "PAYMENT_SUBMITTED", "PREPARING", "READY", "COMPLETED"];
        if (!activeStatuses.includes(order.status)) {
            return res.status(400).json({ message: "This payment link is no longer active" });
        }

        res.json({
            valid: true,
            order: {
                _id: order._id,
                items: order.items,
                totalAmount: order.totalAmount,
                slot: order.slot,
                canteen: order.canteen,
                status: order.status,
                student: order.student,
            },
        });
    } catch (err) {
        next(err);
    }
};
