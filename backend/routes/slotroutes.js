const express = require("express");
const router = express.Router();

const {
  getSlots,
  addSlot,
  updateSlot
} = require("../controllers/slotController");

// GET all time slots
router.get("/", getSlots);

// ADD new slot
router.post("/", addSlot);

// UPDATE slot
router.put("/:id", updateSlot);

module.exports = router;
