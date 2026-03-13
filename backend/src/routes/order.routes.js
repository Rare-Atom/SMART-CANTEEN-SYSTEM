const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const controller = require("../controllers/order.controller");

router.post("/", auth, controller.createOrder);
router.get("/my", auth, controller.getMyOrders);
router.get("/:id", auth, controller.getOrder);

module.exports = router;