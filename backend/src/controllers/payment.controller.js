const crypto = require("crypto");

const PaymentSession = require("../models/PaymentSession");
const Order = require("../models/Order");

const generateExpiry = require("../utils/generatePaymentExpiry");


// Create payment session
exports.createPaymentSession = async (req, res) => {

    const orderId = req.params.orderId;

    const token = crypto.randomBytes(16).toString("hex");

    const expiry = generateExpiry();

    const session = await PaymentSession.create({
        orderId,
        token,
        expiresAt: expiry
    });

    res.json({
        paymentUrl: `/pay/${token}`,
        expiresAt: expiry
    });
};



// Verify token
exports.verifyToken = async (req, res) => {

    const token = req.params.token;

    const session = await PaymentSession.findOne({ token });

    if (!session)
        return res.status(404).json({ message: "Invalid token" });

    if (session.expiresAt < Date.now())
        return res.status(400).json({ message: "Token expired" });

    res.json({
        valid: true,
        expiresAt: session.expiresAt
    });
};



// Confirm payment
exports.confirmPayment = async (req, res) => {

    const token = req.params.token;

    const session = await PaymentSession.findOne({ token });

    if (!session)
        return res.status(404).json({ message: "Invalid token" });

    if (session.expiresAt < Date.now())
        return res.status(400).json({ message: "Payment expired" });

    const order = await Order.findById(session.orderId);

    order.status = "PAID";

    await order.save();

    session.paid = true;

    await session.save();

    res.json({
        message: "Payment successful",
        orderId: order._id
    });
};