const router = require("express").Router();
const controller = require("../controllers/payment.controller");

// GET /api/pay/verify/:token — public, status lookup by payment token
// Students use this to render the /pay/:token page.
// No confirm endpoint here — payment confirmation is staff-only via /api/staff/.
router.get("/verify/:token", controller.verifyToken);

module.exports = router;
