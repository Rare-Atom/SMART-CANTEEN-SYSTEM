const TimeSlot = require("../model/timeslot");

// GET all time slots
exports.getSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.find();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

// ADD new time slot
exports.addSlot = async (req, res) => {
  try {
    const { startTime, endTime, maxOrders } = req.body;

    const newSlot = new TimeSlot({
      startTime,
      endTime,
      maxOrders
    });

    const savedSlot = await newSlot.save();

    res.status(201).json(savedSlot);
  } catch (error) {
    res.status(500).json({ message: "Failed to create slot" });
  }
};

// UPDATE slot capacity or timing
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: "Failed to update slot" });
  }
};
