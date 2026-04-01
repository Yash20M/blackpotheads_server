import express from "express";
import { register, login, forgotPassword } from "../controllers/auth-controller.js";

const router = express.Router();


router.post("/auth/register", register)
router.post("/auth/login", login)
router.post("/auth/forgot-password", forgotPassword)


export default router;