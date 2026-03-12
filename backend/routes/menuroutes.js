const express = require("express");
const router = express.Router();

const {
  getMenu,
  addMenuItem,
  updateMenuItem
} = require("../controllers/menuController");

// GET all menu items
router.get("/", getMenu);

// ADD new menu item
router.post("/", addMenuItem);

// UPDATE menu item
router.put("/:id", updateMenuItem);

module.exports = router;
