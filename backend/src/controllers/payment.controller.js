const Order = require("../models/Order");
const { verifyPaymentSignature, verifyWebhookSignature } = require("../services/razorpay.service");

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
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod || null,
                razorpayPaymentId: order.razorpayPaymentId || null,
                student: order.student,
            },
            // Public info only — never the key secret. Frontend needs these to
            // launch Razorpay Checkout for orders still awaiting payment.
            razorpay: order.status === "ACCEPTED" && order.paymentStatus !== "PAID"
                ? { keyId: process.env.RAZORPAY_KEY_ID || null, orderId: order.razorpayOrderId || null }
                : null,
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/pay/verify-payment  (public — called by Razorpay Checkout's success handler)
// This is a convenience path so the UI updates immediately; it is NOT the sole
// source of truth for "paid" — the signature is cryptographically verified here,
// and the webhook (below) independently confirms/corrects state regardless of
// what the browser reports (covers closed tabs, refreshes, other devices).
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
            return res.status(400).json({ message: "Missing payment verification fields" });
        }

        const order = await Order.findOne({ razorpayOrderId });
        if (!order) return res.status(404).json({ message: "Order not found for this payment" });

        if (order.paymentStatus === "PAID") {
            return res.json({ message: "Payment already verified", order });
        }

        const valid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
        if (!valid) {
            return res.status(400).json({ message: "Payment signature verification failed" });
        }

        order.paymentStatus = "PAID";
        order.razorpayPaymentId = razorpayPaymentId;
        if (order.status === "ACCEPTED" || order.status === "PAYMENT_SUBMITTED") {
            order.status = "PREPARING";
        }
        await order.save();

        res.json({ message: "Payment verified", order });
    } catch (err) {
        next(err);
    }
};

// POST /api/pay/webhook  (public — called by Razorpay's servers, not the browser)
// Source of truth for payment confirmation. Verifies the webhook signature,
// checks amount/currency, and is idempotent against duplicate/delayed delivery.
exports.webhook = async (req, res, next) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const valid = verifyWebhookSignature({ rawBody: req.rawBody, signature });
        if (!valid) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        const event = req.body;

        if (event.event === "payment.failed") {
            const payment = event.payload?.payment?.entity;
            if (!payment) return res.status(200).json({ ok: true });

            const order = await Order.findOne({ razorpayOrderId: payment.order_id });
            // Idempotent, and never downgrade an already-verified payment.
            if (!order || order.paymentStatus === "PAID" || order.paymentStatus === "FAILED") {
                return res.status(200).json({ ok: true });
            }

            order.paymentStatus = "FAILED";
            await order.save();
            return res.status(200).json({ ok: true });
        }

        if (event.event !== "payment.captured") {
            // Acknowledge other events (order.paid, expired, etc.) without processing them.
            return res.status(200).json({ ok: true });
        }

        const payment = event.payload?.payment?.entity;
        if (!payment) return res.status(200).json({ ok: true });

        const order = await Order.findOne({ razorpayOrderId: payment.order_id });
        if (!order) return res.status(200).json({ ok: true }); // unknown order — nothing to do

        // Idempotent: already processed this order's payment.
        if (order.paymentStatus === "PAID") {
            return res.status(200).json({ ok: true, alreadyProcessed: true });
        }

        // Amount (paise) and currency must match exactly what was requested.
        const expectedPaise = Math.round(order.totalAmount * 100);
        if (payment.amount !== expectedPaise || payment.currency !== "INR") {
            return res.status(400).json({ message: "Amount/currency mismatch" });
        }

        order.paymentStatus = "PAID";
        order.razorpayPaymentId = payment.id;
        order.paymentMethod = payment.method || null;
        if (order.status === "ACCEPTED" || order.status === "PAYMENT_SUBMITTED") {
            order.status = "PREPARING";
        }
        await order.save();

        res.status(200).json({ ok: true });
    } catch (err) {
        next(err);
    }
};
