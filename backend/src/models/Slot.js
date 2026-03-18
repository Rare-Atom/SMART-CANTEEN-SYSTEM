const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    time: String,
    active: Boolean
});

module.exports = mongoose.model("Slot", schema);