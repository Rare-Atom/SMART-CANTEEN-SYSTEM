const Slot = require("../models/Slot");

exports.getSlots = async (req, res) => {
    const slots = await Slot.find({ active: true });
    res.json(slots);
};