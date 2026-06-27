import jwt from "jsonwebtoken";
import User from "../models/user.js";

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
        console.log("auth header",authHeader)

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
     
            console.log("decoded", decoded)

        const user = await User.findById(decoded.id);
        if (!user) {
            console.log("❌ User not found for ID:", decoded.id);
            return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
        }

        console.log("user", user)
        
        if (!user.isAdmin) {
            console.log("❌ User is not admin:", user.email);
            return res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
        }

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

/**
 * Optional authentication middleware
 * Attaches user to request if token is valid, but doesn't block if no token
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // If no token, just continue without user
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return next();
        }

        // Try to verify token
        const decoded = jwt.verify(token, process.env.SECRETKEY);
        const user = await User.findById(decoded.id);
        
        if (user) {
            req.user = user;
        }
        
        next();
    } catch (error) {
        // If token is invalid or expired, just continue without user
        // Don't block the request
        next();
    }
};


export { adminMiddleware, authMiddleware, optionalAuthMiddleware };
