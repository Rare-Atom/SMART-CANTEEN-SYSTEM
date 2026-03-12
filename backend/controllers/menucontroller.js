const MenuItem = require("../model/MenuItem");

// GET all menu items
exports.getMenu = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true });
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch menu items" });
  }
};

// ADD new menu item (optional for staff/admin)
exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, category } = req.body;

    const newItem = new MenuItem({
      name,
      price,
      category
    });

    const savedItem = await newItem.save();

    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to add menu item" });
  }
};

// UPDATE menu item (optional)
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Failed to update menu item" });
  }
};
