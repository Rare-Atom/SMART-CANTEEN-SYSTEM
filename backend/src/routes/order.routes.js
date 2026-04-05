const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const controller = require("../controllers/order.controller");

router.post("/",                    protect, controller.createOrder);
router.get("/my",                   protect, controller.getMyOrders);
router.get("/:id",                  protect, controller.getOrder);

// Student notifies they have paid — moves ACCEPTED → PAYMENT_SUBMITTED
router.post("/:id/submit-payment",  protect, controller.submitPayment);

// Student confirms pickup — moves READY → COMPLETED
router.post("/:id/complete",        protect, controller.completeOrder);

module.exports = router;
