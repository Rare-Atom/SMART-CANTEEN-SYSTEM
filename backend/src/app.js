const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Middleware (ONLY ONCE)
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());

// ✅ Health check
app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// ✅ Routes (ONLY ONCE EACH)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/slots", require("./routes/slot.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/pay", require("./routes/payment.routes"));

module.exports = app;