const router = require("express").Router();
const controller = require("../controllers/slot.controller");

router.get("/", controller.getSlots);

module.exports = router;