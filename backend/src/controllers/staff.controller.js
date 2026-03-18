const Order = require("../models/Order");
const PaymentToken = require("../models/PaymentToken");
const crypto = require("crypto");

exports.getPendingOrders = async (req, res) => {
    const orders = await Order.find({ status: "PENDING" });
    res.json(orders);
};

exports.decision = async (req, res) => {

    const order = await Order.findById(req.params.id);

    const { decision } = req.body;

    if (decision === "REJECT") {
        order.status = "CANCELLED";
        await order.save();
        return res.json(order);
    }

    order.status = "ACCEPTED";
    await order.save();

    const token = crypto.randomBytes(16).toString("hex");

    await PaymentToken.create({
        orderId: order._id,
        token,
        expiresAt: Date.now() + 3 * 60 * 1000
    });

    res.json({ paymentUrl: `/pay/${token}` });
};

exports.updateStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);
    order.status = req.body.status;
    await order.save();
    res.json(order);
};