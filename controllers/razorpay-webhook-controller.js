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

            case "refund.created":
                await handleRefundCreated(payloadData);
                break;

            case "refund.processed":
                await handleRefundProcessed(payloadData);
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

/**
 * Handle refund created event
 */
const handleRefundCreated = async (refundData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayPaymentId: refundData.payment_id 
        });

        if (payment) {
            payment.refundId = refundData.id;
            payment.refundStatus = "created";
            await payment.save();

            console.log(`Refund created: ${refundData.id} for payment: ${refundData.payment_id}`);
        }
    } catch (err) {
        console.error("Error handling refund created:", err);
    }
};

/**
 * Handle refund processed event
 */
const handleRefundProcessed = async (refundData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayPaymentId: refundData.payment_id 
        }).populate('orderId');

        if (payment) {
            payment.refundId = refundData.id;
            payment.refundStatus = "processed";
            payment.status = "refunded";
            await payment.save();

            // Update order status to Refunded
            const order = await Order.findById(payment.orderId).populate('items.product');
            if (order) {
                const previousStatus = order.status;
                order.status = "Refunded";
                await order.save();

                // Restore stock if it was previously deducted
                if (previousStatus === "Processing" || previousStatus === "Shipped" || previousStatus === "Delivered") {
                    for (const item of order.items) {
                        const product = await Product.findById(item.product._id);
                        if (product) {
                            product.stock += item.quantity;
                            await product.save();
                            console.log(`Stock restored for ${product.name}: +${item.quantity}`);
                        }
                    }
                }

                console.log(`Order ${order._id} marked as Refunded and stock restored`);
            }
        }
    } catch (err) {
        console.error("Error handling refund processed:", err);
    }
};

export { handleRazorpayWebhook };
