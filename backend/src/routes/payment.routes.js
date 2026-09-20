const router = require("express").Router();
const controller = require("../controllers/payment.controller");

// GET /api/pay/verify/:token — public, status lookup by payment token
// Students use this to render the /pay/:token page.
router.get("/verify/:token", controller.verifyToken);

// POST /api/pay/verify-payment — public, called by Razorpay Checkout's client-side
// success handler. Cryptographically verified; the webhook below is the real
// source of truth and independently confirms the same payment.
router.post("/verify-payment", controller.verifyPayment);

// POST /api/pay/webhook — public, called by Razorpay's servers only.
// Signature-verified, idempotent. This is the source of truth for "paid".
router.post("/webhook", controller.webhook);

module.exports = router;
