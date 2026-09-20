const Settings = require("../models/Settings");
const { isWithinOrderingWindow, WINDOWS } = require("../utils/orderingWindow");

// GET /api/settings/ordering-status — public, used by student-facing UI
exports.getOrderingStatus = async (req, res, next) => {
    try {
        const settings = await Settings.getSingleton();
        const withinWindow = isWithinOrderingWindow();

        let open;
        if (settings.overrideMode === "CLOSED") open = false;
        else if (settings.overrideMode === "OPEN") open = true;
        else open = withinWindow;

        res.json({
            open,
            overrideMode: settings.overrideMode,
            withinWindow,
            windows: WINDOWS,
            message: settings.message || null,
        });
    } catch (err) {
        next(err);
    }
};

// PUT /api/staff/settings/ordering — staff-only toggle
// body: { overrideMode: "AUTO" | "CLOSED" | "OPEN", message?: string }
exports.setOrderingStatus = async (req, res, next) => {
    try {
        const { overrideMode, message } = req.body;
        if (!["AUTO", "CLOSED", "OPEN"].includes(overrideMode)) {
            return res.status(400).json({ message: "overrideMode must be AUTO, CLOSED, or OPEN" });
        }

        const settings = await Settings.getSingleton();
        settings.overrideMode = overrideMode;
        settings.message = message || "";
        settings.updatedBy = req.user.id;
        await settings.save();

        res.json({ message: "Ordering status updated", settings });
    } catch (err) {
        next(err);
    }
};
