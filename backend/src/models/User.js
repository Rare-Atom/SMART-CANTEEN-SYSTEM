const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: {
        type: String,
        enum: ["student", "staff"],
        default: "student"
    }
});

module.exports = mongoose.model("User", schema);