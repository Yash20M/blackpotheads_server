import User from "../models/user.js";
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
        }
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
        }
        if (!user.isAdmin) {
            return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
        }

        req.admin = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


export { authMiddleware, adminMiddleware };