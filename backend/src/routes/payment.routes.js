const router = require("express").Router();

const paymentController = require("../controllers/payment.controller");

router.get("/:token", paymentController.verifyToken);

router.post("/:token/confirm", paymentController.confirmPayment);

module.exports = router;