const Order = require("../models/Order");
const PaymentToken = require("../models/paymentToken");
const crypto = require("crypto");


// CREATE ORDER (Student)
exports.createOrder = async (req, res) => {
try {

    const { items, slot, totalAmount } = req.body;

    const order = await Order.create({
        student: req.user.id,
        items,
        slot,
        totalAmount
    });

    res.status(201).json(order);

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// GET MY ORDERS (Student)
exports.getMyOrders = async (req, res) => {
try {

    const orders = await Order.find({ student: req.user.id })
        .populate("items.menuItem")
        .populate("slot")
        .sort({ createdAt: -1 });

    res.json(orders);

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// GET SINGLE ORDER
exports.getOrderById = async (req, res) => {
try {

    const order = await Order.findById(req.params.id)
        .populate("items.menuItem")
        .populate("slot")
        .populate("student");

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// STAFF: GET ALL ORDERS
exports.getAllOrders = async (req, res) => {
try {

    const status = req.query.status;

    let filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .populate("student", "name email")
        .populate("items.menuItem")
        .populate("slot")
        .sort({ createdAt: -1 });

    res.json(orders);

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// STAFF ACCEPT ORDER
exports.acceptOrder = async (req, res) => {
try {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    order.status = "ACCEPTED";
    await order.save();

    // generate payment token (valid 3 minutes)

    const token = crypto.randomBytes(20).toString("hex");

    await PaymentToken.create({
        order: order._id,
        token: token,
        expiresAt: new Date(Date.now() + 3 * 60 * 1000)
    });

    res.json({
        message: "Order accepted",
        paymentToken: token
    });

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// STAFF REJECT ORDER
exports.rejectOrder = async (req, res) => {
try {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    order.status = "REJECTED";
    await order.save();

    res.json({ message: "Order rejected" });

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// MARK PREPARING
exports.markPreparing = async (req, res) => {
try {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    order.status = "PREPARING";
    await order.save();

    res.json({ message: "Order is preparing" });

} catch (error) {
    res.status(500).json({ message: error.message });
}
};


// MARK READY
exports.markReady = async (req, res) => {
try {

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    order.status = "READY";
    await order.save();

    res.json({ message: "Order is ready" });

} catch (error) {
    res.status(500).json({ message: error.message });
}
};
