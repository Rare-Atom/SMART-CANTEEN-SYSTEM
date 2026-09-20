const mongoose = require("mongoose");

// Singleton document (fixed _id) holding canteen-wide ordering control.
// overrideMode:
//   AUTO   — ordering follows the configured IST windows (default)
//   CLOSED — ordering is force-closed regardless of window
//   OPEN   — ordering is force-open regardless of window (emergency override)
const settingsSchema = new mongoose.Schema({
    _id: { type: String, default: "GLOBAL" },
    overrideMode: {
        type: String,
        enum: ["AUTO", "CLOSED", "OPEN"],
        default: "AUTO"
    },
    message: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

settingsSchema.statics.getSingleton = async function () {
    let doc = await this.findById("GLOBAL");
    if (!doc) doc = await this.create({ _id: "GLOBAL" });
    return doc;
};

module.exports = mongoose.model("Settings", settingsSchema);
