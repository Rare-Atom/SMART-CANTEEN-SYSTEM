const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
    const order = await Order.create({
        student: req.user.id,
        items: req.body.items
    });

    res.json(order);
};

exports.getMyOrders = async (req, res) => {
    const orders = await Order.find({ student: req.user.id });
    res.json(orders);
};

exports.getOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.json(order);
};