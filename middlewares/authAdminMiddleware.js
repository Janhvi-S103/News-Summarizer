const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logging");

module.exports = async (req, res, next) => {
    try {
        // Admin token ONLY
        let token = req.cookies.adminAuth;

        if (!token) {
            logger.warn("Admin access denied → No admin token");
            return res.status(401).json({ message: "Admin login required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            logger.warn("Invalid admin JWT");
            return res.status(401).json({ message: "Invalid admin token" });
        }

        const admin = await User.findById(decoded.userId).select("username role");

        if (!admin || admin.role !== "admin") {
            logger.warn("Non-admin attempted to access admin panel", { username: admin?.username });
            return res.status(403).json({ message: "Admin only" });
        }

        req.user = {
            userId: admin._id,
            username: admin.username,
            role: admin.role
        };

        next();
    } catch (error) {
        logger.error("Admin middleware fatal error", { error: error.message });
        res.status(500).json({ message: "Server error" });
    }
};
