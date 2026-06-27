import express from "express";
import { getProfile, updateProfile } from "../controllers/user-controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.get("/user/profile", authMiddleware, getProfile);

router.put("/user/update-profile", authMiddleware, updateProfile);

router.get("/admin/profile", adminMiddleware, getProfile);

export default router;  