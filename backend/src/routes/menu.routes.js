const router = require("express").Router();
const { protect } = require("../middleware/auth.middleware");
const staffOnly = require("../middleware/role.middleware")("staff");
const controller = require("../controllers/menu.controller");

// NOTE: /all must be declared before /:id so Express doesn't treat "all" as a param.

// GET  /api/menu?canteen=MAIN|SCAS  — visible items for a canteen (students & guests)
router.get("/",                   controller.getMenu);

// GET  /api/menu/all              — all items incl. unavailable (staff only)
router.get("/all",                protect, staffOnly, controller.getAllMenuAdmin);

// POST /api/menu                  — create new item (staff only)
router.post("/",                  protect, staffOnly, controller.createMenuItem);

// PUT  /api/menu/:id              — update price / description / image (staff only)
router.put("/:id",                protect, staffOnly, controller.updateMenuItem);

// PATCH /api/menu/:id/availability — toggle per-canteen availability (staff only)
router.patch("/:id/availability", protect, staffOnly, controller.toggleAvailability);

module.exports = router;
