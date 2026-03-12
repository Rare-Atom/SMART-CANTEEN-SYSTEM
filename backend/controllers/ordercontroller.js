const Order = require('../models/Order');

// Helper to standardize error responses
const handleError = (res, error, defaultMessage = 'Something went wrong') => {
  // eslint-disable-next-line no-console
  console.error(error);
  return res.status(500).json({ success: false, message: defaultMessage });
};

exports.createOrder = async (req, res) => {
  try {
    const { items, timeSlot, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    const sanitizedItems = [];
    let computedTotal = 0;

    for (const item of items) {
      const { menuItemId, quantity, price } = item;
      if (!menuItemId || !quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ success: false, message: 'Each item must include menuItemId and quantity > 0' });
      }

      const itemPrice = typeof price === 'number' && price >= 0 ? price : 0;
      computedTotal += itemPrice * quantity;

      sanitizedItems.push({
        menuItemId,
        quantity,
        // Persist price if provided so the order total is auditable later.
        ...(typeof price === 'number' ? { price: itemPrice } : {}),
      });
    }

    const finalTotal =
      typeof totalAmount === 'number' && totalAmount >= 0 ? totalAmount : computedTotal;

    if (finalTotal <= 0) {
      return res
        .status(400)
        .json({ success: false, message: 'totalAmount must be greater than zero' });
    }

    if (!timeSlot) {
      return res.status(400).json({ success: false, message: 'timeSlot is required' });
    }

    const order = await Order.create({
      studentId: req.user.id,
      items: sanitizedItems,
      totalAmount: finalTotal,
      timeSlot,
      status: 'PENDING',
    });

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to create order');
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return handleError(res, error, 'Unable to fetch orders');
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isOwner = order.studentId.toString() === req.user.id;
    const isStaff = req.user.role === 'staff';
    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to fetch order');
  }
};

exports.getStaffOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status.toUpperCase();
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    return handleError(res, error, 'Unable to fetch staff orders');
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res
        .status(400)
        .json({ success: false, message: 'Only PENDING orders can be accepted' });
    }

    order.status = 'ACCEPTED';

    // TODO: Invoke Payment service to generate a 3-minute payment token and
    //       set order.paymentTokenRef with the created token's _id.

    await order.save();
    return res.json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to accept order');
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PENDING') {
      return res
        .status(400)
        .json({ success: false, message: 'Only PENDING orders can be rejected' });
    }

    order.status = 'REJECTED';
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to reject order');
  }
};

exports.markPreparing = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PAID') {
      return res
        .status(400)
        .json({ success: false, message: 'Order must be PAID before marking PREPARING' });
    }

    order.status = 'PREPARING';
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to update order status to PREPARING');
  }
};

exports.markReady = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'PREPARING') {
      return res
        .status(400)
        .json({ success: false, message: 'Order must be PREPARING before marking READY' });
    }

    order.status = 'READY';
    await order.save();

    return res.json({ success: true, data: order });
  } catch (error) {
    return handleError(res, error, 'Unable to update order status to READY');
  }
};
