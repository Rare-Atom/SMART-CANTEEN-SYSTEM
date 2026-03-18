const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/staff.controller");

router.get("/orders", auth, role("staff"), controller.getPendingOrders);

router.patch(
    "/orders/:id/decision",
    auth,
    role("staff"),
    controller.decision
);

router.patch(
    "/orders/:id/status",
    auth,
    role("staff"),
    controller.updateStatus
);

module.exports = router;