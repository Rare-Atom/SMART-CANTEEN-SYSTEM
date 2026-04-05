const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.json({ ok: true });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",   require("./routes/auth.routes"));
app.use("/api/menu",   require("./routes/menu.routes"));
app.use("/api/slots",  require("./routes/slot.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/staff",  require("./routes/staff.routes"));
app.use("/api/pay",    require("./routes/payment.routes"));

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
