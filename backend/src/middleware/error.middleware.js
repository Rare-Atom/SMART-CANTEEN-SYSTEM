// Global error handler — must be registered as the last middleware in app.js
// Controllers call next(err) to route errors here instead of crashing the process.

module.exports = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path} —`, err.message);

    const status = err.status || 500;
    const message = err.status ? err.message : "Internal server error";

    res.status(status).json({ message });
};
