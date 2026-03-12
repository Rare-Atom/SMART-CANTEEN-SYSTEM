const mongoose = require("mongoose");
require("dotenv").config();

const TimeSlot = require("../model/timeslot");

mongoose.connect(process.env.MONGO_URI);

const slots = [
  { startTime: "12:00", endTime: "12:15", maxOrders: 20 },
  { startTime: "12:15", endTime: "12:30", maxOrders: 20 },
  { startTime: "12:30", endTime: "12:45", maxOrders: 20 },
  { startTime: "12:45", endTime: "13:00", maxOrders: 20 }
];

async function seedSlots() {
  try {
    await TimeSlot.deleteMany();
    await TimeSlot.insertMany(slots);

    console.log("Slots seeded successfully");
    process.exit();
  } catch (error) {
    console.log("Error seeding slots:", error);
    process.exit(1);
  }
}

seedSlots();
