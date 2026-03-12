const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");


// STUDENT ROUTES

router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    orderController.createOrder
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    orderController.getMyOrders
);

router.get(
    "/:id",
    authMiddleware,
    orderController.getOrderById
);


// STAFF ROUTES

router.get(
    "/staff/all",
    authMiddleware,
    roleMiddleware("staff"),
    orderController.getAllOrders
);

router.patch(
    "/staff/:id/accept",
    authMiddleware,
    roleMiddleware("staff"),
    orderController.acceptOrder
);

router.patch(
    "/staff/:id/reject",
    authMiddleware,
    roleMiddleware("staff"),
    orderController.rejectOrder
);

router.patch(
    "/staff/:id/preparing",
    authMiddleware,
    roleMiddleware("staff"),
    orderController.markPreparing
);

router.patch(
    "/staff/:id/ready",
    authMiddleware,
    roleMiddleware("staff"),
    orderController.markReady
);

module.exports = router;
