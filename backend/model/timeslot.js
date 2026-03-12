const mongoose = require("mongoose");

const TimeSlotSchema = new mongoose.Schema({

  startTime: {
    type: String,
    required: true
  },

  endTime: {
    type: String,
    required: true
  },

  maxOrders: {
    type: Number,
    default: 20
  },

  currentOrders: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
