const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ ok: true });
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/menu", require("./routes/menu.routes"));
app.use("/api/slots", require("./routes/slot.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/pay", require("./routes/payment.routes"));

module.exports = app;