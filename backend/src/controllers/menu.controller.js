const MenuItem = require("../models/MenuItem");

// GET /api/menu?canteen=MAIN|SCAS
// Students: returns only items where available=true AND availableAt[canteen]=true
exports.getMenu = async (req, res, next) => {
    try {
        const canteen = req.query.canteen;

        if (!canteen || !["MAIN", "SCAS"].includes(canteen)) {
            return res.status(400).json({ message: "Query param ?canteen=MAIN or ?canteen=SCAS is required" });
        }

        // All items are canteen:"BOTH" — filter only by master available flag
        // and the per-canteen availableAt toggle that staff controls.
        const availField = canteen === "MAIN"
            ? { "availableAt.MAIN": true }
            : { "availableAt.SCAS": true };

        const items = await MenuItem.find({
            available: true,
            ...availField,
        }).lean();

        res.json(items);
    } catch (err) {
        next(err);
    }
};

// GET /api/menu/all — ALL items regardless of availability (staff only)
exports.getAllMenuAdmin = async (req, res, next) => {
    try {
        const items = await MenuItem.find({}).lean();
        res.json(items);
    } catch (err) {
        next(err);
    }
};

// POST /api/menu — create a new menu item (staff only)
exports.createMenuItem = async (req, res, next) => {
    try {
        const { name, price, category, image, description, availableAt } = req.body;

        if (!name || price === undefined || !category) {
            return res.status(400).json({ message: "name, price, and category are required" });
        }
        if (!["veg", "nonveg", "snacks", "drinks"].includes(category)) {
            return res.status(400).json({ message: "category must be veg, nonveg, snacks, or drinks" });
        }

        const item = await MenuItem.create({
            name:        name.trim(),
            price:       Number(price),
            category,
            image:       image || "",
            description: description || "",
            canteen:     "BOTH",
            available:   true,
            availableAt: {
                MAIN: availableAt?.MAIN !== false,
                SCAS: availableAt?.SCAS !== false,
            },
        });

        res.status(201).json(item);
    } catch (err) {
        next(err);
    }
};

// PUT /api/menu/:id — update price, description, image (staff only)
exports.updateMenuItem = async (req, res, next) => {
    try {
        const { price, description, image, name, category } = req.body;
        const update = {};

        if (name !== undefined)        update.name        = String(name).trim();
        if (price !== undefined)       update.price       = Number(price);
        if (description !== undefined) update.description = description;
        if (image !== undefined)       update.image       = image;
        if (category !== undefined) {
            if (!["veg", "nonveg", "snacks", "drinks"].includes(category)) {
                return res.status(400).json({ message: "Invalid category" });
            }
            update.category = category;
        }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ message: "No updatable fields provided" });
        }

        const item = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true, runValidators: true }
        );
        if (!item) return res.status(404).json({ message: "Menu item not found" });

        res.json(item);
    } catch (err) {
        next(err);
    }
};

// PATCH /api/menu/:id/availability — toggle per-canteen availability (staff only)
// Body: { canteen: "MAIN" | "SCAS" | "ALL", available: true | false }
exports.toggleAvailability = async (req, res, next) => {
    try {
        const { canteen, available } = req.body;

        if (typeof available !== "boolean") {
            return res.status(400).json({ message: "`available` must be a boolean" });
        }

        const item = await MenuItem.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Menu item not found" });

        if (canteen === "ALL") {
            item.available = available;
        } else if (canteen === "MAIN" || canteen === "SCAS") {
            item.availableAt[canteen] = available;
            item.markModified("availableAt");
        } else {
            return res.status(400).json({ message: "canteen must be MAIN, SCAS, or ALL" });
        }

        await item.save();
        res.json(item);
    } catch (err) {
        next(err);
    }
};
