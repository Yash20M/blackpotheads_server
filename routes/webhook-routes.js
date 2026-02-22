import { Router } from "express";
import { handleRazorpayWebhook } from "../controllers/razorpay-webhook-controller.js";
import express from "express";

const router = Router();

// Webhook route - must use raw body for signature verification
router.post(
    "/razorpay", 
    express.raw({ type: "application/json" }), 
    handleRazorpayWebhook
);

export default router;
