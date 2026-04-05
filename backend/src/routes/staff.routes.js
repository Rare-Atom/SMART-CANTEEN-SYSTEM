const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const staffOnly = require("../middleware/role.middleware")("staff");
const controller = require("../controllers/staff.controller");

// All routes here require a valid JWT with role="staff".
// Specific string sub-routes come BEFORE parameterised /:id routes.

router.get("/orders",                               protect, staffOnly, controller.getAllOrders);
router.get("/orders/pending",                       protect, staffOnly, controller.getPendingOrders);
router.get("/orders/:id",                           protect, staffOnly, controller.getOrderById);

// Accept or reject a PENDING order
router.post("/orders/:id/decision",                 protect, staffOnly, controller.decision);

// Staff confirms student's submitted payment → moves to PREPARING
router.post("/orders/:id/confirm-payment",          protect, staffOnly, controller.confirmPaymentByStaff);

// Staff manually updates workflow status (PREPARING → READY etc.)
router.put("/orders/:id/status",                    protect, staffOnly, controller.updateStatus);

module.exports = router;
