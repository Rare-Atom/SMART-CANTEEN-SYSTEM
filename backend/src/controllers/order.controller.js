const Order = require("../models/Order");

// POST /api/orders — student places a new order
exports.createOrder = async (req, res, next) => {
    try {
        const { items, totalAmount, slot, canteen } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Order must contain at least one item" });
        }
        if (!totalAmount) {
            return res.status(400).json({ message: "Total amount is required" });
        }
        if (!canteen || !["MAIN", "SCAS"].includes(canteen)) {
            return res.status(400).json({ message: "Select a valid canteen: MAIN or SCAS" });
        }

        const mappedItems = items.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.qty ?? i.quantity,
        }));

        const order = await Order.create({
            student: req.user.id,
            items: mappedItems,
            totalAmount,
            slot: slot || null,
            canteen,
            status: "PENDING",
        });

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

// GET /api/orders/my — student's own order history
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ student: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// GET /api/orders/:id — single order (student must own it)
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).lean();

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.student.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
};

// POST /api/orders/:id/submit-payment
// Student notifies they have paid — moves order from ACCEPTED → PAYMENT_SUBMITTED.
// Does NOT confirm payment; staff must confirm separately.
exports.submitPayment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.student.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (order.status !== "ACCEPTED") {
            return res.status(400).json({
                message: `Cannot submit payment — order is currently ${order.status}`,
            });
        }

        order.status = "PAYMENT_SUBMITTED";
        await order.save();

        res.json({ message: "Payment submitted. Awaiting staff confirmation.", order });
    } catch (err) {
        next(err);
    }
};

// POST /api/orders/:id/complete
// Student confirms they have picked up a READY order → COMPLETED.
exports.completeOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.student.toString() !== req.user.id) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (order.status !== "READY") {
            return res.status(400).json({
                message: `Order is not ready for pickup — current status: ${order.status}`,
            });
        }

        order.status = "COMPLETED";
        await order.save();

        res.json({ message: "Order completed. Enjoy your meal!", order });
    } catch (err) {
        next(err);
    }
};
