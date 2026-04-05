require('dotenv').config();
const app = require("./app");
const connectDB = require("./config/db");
const seedDatabase = require("./seed");

const PORT = process.env.PORT || 5000;

async function start() {
    await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

start();
