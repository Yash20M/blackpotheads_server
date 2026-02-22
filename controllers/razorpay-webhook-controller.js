import Order from "../models/order.js";
import Payment from "../models/Payment.js";
import Product from "../models/Product.js";
import { verifyRazorpaySignature } from "../utils/razorpay.js";

/**
 * Handle Razorpay webhook events
 */
const handleRazorpayWebhook = async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = req.body;

        // Verify webhook signature
        const isValid = verifyRazorpaySignature(body, signature);

        if (!isValid) {
            console.error("Invalid webhook signature");
            return res.status(400).json({ 
                success: false, 
                message: "Invalid signature" 
            });
        }

        const event = body.event;
        const payloadData = body.payload.payment.entity;

        console.log(`Webhook received: ${event}`);

        switch (event) {
            case "payment.authorized":
                await handlePaymentAuthorized(payloadData);
                break;

            case "payment.captured":
                await handlePaymentCaptured(payloadData);
                break;

            case "payment.failed":
                await handlePaymentFailed(payloadData);
                break;

            case "order.paid":
                await handleOrderPaid(payloadData);
                break;

            default:
                console.log(`Unhandled event: ${event}`);
        }

        res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (err) {
        console.error("Webhook processing error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Webhook processing failed", 
            error: err.message 
        });
    }
};

/**
 * Handle payment authorized event
 */
const handlePaymentAuthorized = async (paymentData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayOrderId: paymentData.order_id 
        });

        if (payment) {
            payment.razorpayPaymentId = paymentData.id;
            payment.status = "authorized";
            payment.paymentMethod = paymentData.method;
            await payment.save();

            console.log(`Payment authorized: ${paymentData.id}`);
        }
    } catch (err) {
        console.error("Error handling payment authorized:", err);
    }
};

/**
 * Handle payment captured event
 */
const handlePaymentCaptured = async (paymentData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayOrderId: paymentData.order_id 
        }).populate('orderId');

        if (payment) {
            payment.razorpayPaymentId = paymentData.id;
            payment.status = "captured";
            payment.paymentMethod = paymentData.method;
            await payment.save();

            // Update order status
            const order = await Order.findById(payment.orderId).populate('items.product');
            if (order && order.status === "Pending") {
                // Deduct stock
                for (const item of order.items) {
                    const product = await Product.findById(item.product._id);
                    if (product) {
                        product.stock -= item.quantity;
                        await product.save();
                    }
                }

                order.status = "Processing";
                await order.save();

                console.log(`Order ${order._id} confirmed and stock deducted`);
            }
        }
    } catch (err) {
        console.error("Error handling payment captured:", err);
    }
};

/**
 * Handle payment failed event
 */
const handlePaymentFailed = async (paymentData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayOrderId: paymentData.order_id 
        });

        if (payment) {
            payment.razorpayPaymentId = paymentData.id;
            payment.status = "failed";
            await payment.save();

            // Update order status to cancelled
            const order = await Order.findById(payment.orderId);
            if (order) {
                order.status = "Cancelled";
                await order.save();

                console.log(`Order ${order._id} cancelled due to payment failure`);
            }
        }
    } catch (err) {
        console.error("Error handling payment failed:", err);
    }
};

/**
 * Handle order paid event
 */
const handleOrderPaid = async (orderData) => {
    try {
        console.log(`Order paid event received for: ${orderData.id}`);
        // Additional logic if needed
    } catch (err) {
        console.error("Error handling order paid:", err);
    }
};

export { handleRazorpayWebhook };
