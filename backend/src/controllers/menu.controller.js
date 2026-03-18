const MenuItem = require("../models/MenuItem");

exports.getMenu = async (req, res) => {
    const items = await MenuItem.find({ available: true });
    res.json(items);
};