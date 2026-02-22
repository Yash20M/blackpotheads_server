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
            console.log("❌ Admin auth failed: No Bearer token");
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log("❌ Admin auth failed: Token empty");
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        console.log("🔍 Verifying admin token with ADMIN_SECRET");
        const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
        console.log("✅ Token decoded:", decoded);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("❌ User not found for ID:", decoded.id);
            return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
        }
        
        if (!user.isAdmin) {
            console.log("❌ User is not admin:", user.email);
            return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
        }

        console.log("✅ Admin authenticated:", user.email);
        req.admin = user;
        next();
    } catch (error) {
        console.error("❌ Admin middleware error:", error.message);
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