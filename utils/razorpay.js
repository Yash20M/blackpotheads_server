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

/**
 * Process refund via Razorpay API
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in paise (optional for partial refund)
 * @param {object} notes - Additional notes (optional)
 * @returns {Promise<object>} Refund object from Razorpay
 */
export const processRefund = async (paymentId, amount = null, notes = {}) => {
  try {
    const refundData = {
      ...(amount && { amount }), // If amount is provided, it's a partial refund
      notes
    };

    const refund = await razorpayInstance.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error("Razorpay refund error:", error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};
