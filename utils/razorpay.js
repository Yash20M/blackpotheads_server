import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// Verify Razorpay webhook signature
export const verifyRazorpaySignature = (body, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(body))
    .digest("hex");

  return expectedSignature === signature;
};

// Verify payment signature (for frontend verification)
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const body = orderId + "|" + paymentId;
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};
