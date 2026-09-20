const Slot = require("../models/Slot");

exports.getSlots = async (req, res, next) => {
    try {
        const slots = await Slot.find({ active: true }).sort({ order: 1 });
        res.json(slots);
    } catch (err) {
        next(err);
    }
};
