const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: String,
    price: Number,
    available: Boolean
});

module.exports = mongoose.model("MenuItem", schema);