const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://smart-canteen-system-zeta.vercel.app",
      "https://smart-canteen-system.vercel.app"
    ],
    credentials: true,
  })
);

// Body parsers
// `verify` captures the raw request body so the Razorpay webhook handler can
// compute an HMAC over the exact bytes Razorpay signed (JSON.stringify would
// not reliably reproduce the same byte sequence).
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/slots", require("./routes/slot.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/pay", require("./routes/payment.routes"));
app.use("/api/settings", require("./routes/settings.routes"));

// Error handler
app.use(errorMiddleware);

module.exports = app;