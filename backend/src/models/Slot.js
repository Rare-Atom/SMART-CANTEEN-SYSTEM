const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    time: String,
    active: Boolean,
    // Explicit display order (AM/PM time strings don't sort correctly as text)
    order: { type: Number, default: 0 }
});

module.exports = mongoose.model("Slot", schema);