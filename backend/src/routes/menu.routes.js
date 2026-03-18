const router = require("express").Router();
const controller = require("../controllers/menu.controller");

router.get("/", controller.getMenu);

module.exports = router;