const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ── REGISTER ──────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, staffCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        // Role assignment: default to student.
        // Staff registration requires a server-side code set in STAFF_CODE env var.
        // Falls back to "SIST2024" if the env var is not configured.
        let assignedRole = "student";
        if (role === "staff") {
            const serverCode = process.env.STAFF_CODE || "SIST2024";
            if (staffCode !== serverCode) {
                return res.status(403).json({ message: "Invalid staff code. Contact the canteen manager." });
            }
            assignedRole = "staff";
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed, role: assignedRole });

        res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        next(err);
    }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            role: user.role,
            name: user.name,
        });
    } catch (err) {
        next(err);
    }
};
