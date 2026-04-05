const Order = require("../models/Order");
const PaymentSession = require("../models/PaymentSession");
const crypto = require("crypto");
const generatePaymentExpiry = require("../utils/generatePaymentExpiry");

// GET /api/staff/orders — all orders, newest first
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate("student", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// GET /api/staff/orders/pending — pending only
exports.getPendingOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ status: "PENDING" })
            .populate("student", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// GET /api/staff/orders/:id — single order detail
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("student", "name email")
            .lean();

        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (err) {
        next(err);
    }
};

// POST /api/staff/orders/:id/decision — ACCEPT or REJECT a PENDING order
exports.decision = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status !== "PENDING") {
            return res.status(400).json({ message: `Order is already ${order.status}` });
        }

        const { decision } = req.body;

        if (decision === "REJECT") {
            order.status = "CANCELLED";
            await order.save();
            return res.json({ order });
        }

        if (decision === "ACCEPT") {
            const token = crypto.randomBytes(16).toString("hex");

            order.status = "ACCEPTED";
            order.paymentToken = token;
            await order.save();

            // Keep PaymentSession for backward compatibility / token lookup
            await PaymentSession.create({
                orderId: order._id,
                token,
                expiresAt: generatePaymentExpiry(),
            });

            return res.json({ order, paymentUrl: `/pay/${token}` });
        }

        return res.status(400).json({ message: "Decision must be ACCEPT or REJECT" });
    } catch (err) {
        next(err);
    }
};

// POST /api/staff/orders/:id/confirm-payment
// Staff verifies the student's payment (order must be PAYMENT_SUBMITTED).
// Security: only role="staff" can call this (enforced in route middleware).
// Moves order: PAYMENT_SUBMITTED → PREPARING
exports.confirmPaymentByStaff = async (req, res, next) => {
    try {
        if (req.user.role !== "staff") {
            return res.status(403).json({ message: "Only staff can confirm payments" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (order.status !== "PAYMENT_SUBMITTED") {
            return res.status(400).json({
                message: `Cannot confirm payment — order status is ${order.status}. Student must submit payment first.`,
            });
        }

        order.status = "PREPARING";
        await order.save();

        res.json({ message: "Payment confirmed. Order is now being prepared.", order });
    } catch (err) {
        next(err);
    }
};

// PUT /api/staff/orders/:id/status — manual workflow status update
// Allowed transitions staff can make:
//   PREPARING → READY
// The enum validation in the model guards invalid values.
exports.updateStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        const { status } = req.body;

        // Only allow forward manual transitions by staff
        const staffAllowed = ["PREPARING", "READY", "CANCELLED"];
        if (!staffAllowed.includes(status)) {
            return res.status(400).json({
                message: `Staff can only set status to: ${staffAllowed.join(", ")}`,
            });
        }

        // Guard against accidental backwards moves
        const order_rank = { PENDING: 0, ACCEPTED: 1, PAYMENT_SUBMITTED: 2, PREPARING: 3, READY: 4, COMPLETED: 5, CANCELLED: 99 };
        if (status !== "CANCELLED" && order_rank[status] < order_rank[order.status]) {
            return res.status(400).json({ message: `Cannot move order backwards from ${order.status} to ${status}` });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        next(err);
    }
};
