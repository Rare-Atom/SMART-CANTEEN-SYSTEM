const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getStaffOrders,
  acceptOrder,
  rejectOrder,
  markPreparing,
  markReady,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Student routes
router.post('/', authMiddleware, roleMiddleware(['student']), createOrder);
router.get('/my', authMiddleware, roleMiddleware(['student']), getMyOrders);
router.get('/:id', authMiddleware, getOrderById); // ownership is checked inside controller

// Staff routes
router.get('/staff/orders', authMiddleware, roleMiddleware(['staff']), getStaffOrders);

router.patch(
  '/staff/orders/:id/decision',
  authMiddleware,
  roleMiddleware(['staff']),
  (req, res) => {
    const decision = (req.body.decision || '').toUpperCase();
    if (decision === 'ACCEPT') {
      return acceptOrder(req, res);
    }
    if (decision === 'REJECT') {
      return rejectOrder(req, res);
    }
    return res
      .status(400)
      .json({ success: false, message: 'decision must be ACCEPT or REJECT' });
  },
);

router.patch(
  '/staff/orders/:id/status',
  authMiddleware,
  roleMiddleware(['staff']),
  (req, res) => {
    const status = (req.body.status || '').toUpperCase();
    if (status === 'PREPARING') {
      return markPreparing(req, res);
    }
    if (status === 'READY') {
      return markReady(req, res);
    }
    return res
      .status(400)
      .json({ success: false, message: 'status must be PREPARING or READY' });
  },
);

module.exports = router;
