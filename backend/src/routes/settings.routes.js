const router = require("express").Router();
const controller = require("../controllers/settings.controller");

// Public — student-facing menu/checkout pages read this to show ordering state
router.get("/ordering-status", controller.getOrderingStatus);

module.exports = router;
