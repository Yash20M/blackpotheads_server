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

        console.log(`📨 Webhook received: ${body.event}`);

        // Verify webhook signature using RAZORPAY_WEBHOOK_SECRET
        const isValid = verifyRazorpaySignature(body, signature);

        if (!isValid) {
            console.error("❌ Invalid webhook signature");
            return res.status(400).json({ 
                success: false, 
                message: "Invalid signature" 
            });
        }

        console.log("✅ Webhook signature verified");

        const event = body.event;
        
        // Extract payload data based on event type
        let payloadData;
        if (event.startsWith('payment.')) {
            payloadData = body.payload.payment.entity;
        } else if (event.startsWith('order.')) {
            payloadData = body.payload.order.entity;
        } else if (event.startsWith('refund.')) {
            payloadData = body.payload.refund.entity;
        } else {
            payloadData = body.payload;
        }

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
                console.log(`ℹ️ Unhandled event: ${event}`);
        }

        res.status(200).json({ success: true, message: "Webhook processed" });

    } catch (err) {
        console.error("❌ Webhook processing error:", err);
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
            
            // Store refund amount if not already set
            if (!payment.refundAmount) {
                payment.refundAmount = refundData.amount / 100; // Convert from paise to rupees
            }
            
            await payment.save();

            console.log(`✅ Refund created: ${refundData.id} for payment: ${refundData.payment_id}`);
        } else {
            console.warn(`⚠️ Payment not found for refund.created event: ${refundData.payment_id}`);
        }
    } catch (err) {
        console.error("❌ Error handling refund created:", err);
    }
};

/**
 * Handle refund processed event
 * This is when the refund is actually completed and money is returned to customer
 */
const handleRefundProcessed = async (refundData) => {
    try {
        const payment = await Payment.findOne({ 
            razorpayPaymentId: refundData.payment_id 
        }).populate('orderId');

        if (!payment) {
            console.warn(`⚠️ Payment not found for refund.processed event: ${refundData.payment_id}`);
            return;
        }

        console.log(`🔄 Processing refund: ${refundData.id} for payment: ${refundData.payment_id}`);

        // Update payment record
        payment.refundId = refundData.id;
        payment.refundStatus = "processed";
        payment.status = "refunded";
        
        // Store refund amount if not already set
        if (!payment.refundAmount) {
            payment.refundAmount = refundData.amount / 100; // Convert from paise to rupees
        }
        
        await payment.save();

        console.log(`✅ Payment marked as refunded: ${payment._id}`);

        // Update order status to Refunded
        const order = await Order.findById(payment.orderId).populate('items.product');
        if (!order) {
            console.warn(`⚠️ Order not found for payment: ${payment._id}`);
            return;
        }

        const previousStatus = order.status;
        order.status = "Refunded";
        await order.save();

        console.log(`✅ Order ${order._id} status updated: ${previousStatus} → Refunded`);

        // Restore stock if it was previously deducted
        // Only restore stock if order was in a state where stock was deducted
        const stockDeductedStatuses = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
        
        if (stockDeductedStatuses.includes(previousStatus)) {
            for (const item of order.items) {
                const product = await Product.findById(item.product._id);
                if (product) {
                    const oldStock = product.stock;
                    product.stock += item.quantity;
                    await product.save();
                    console.log(`📦 Stock restored for ${product.name}: ${oldStock} → ${product.stock} (+${item.quantity})`);
                }
            }
            console.log(`✅ Stock restored for all items in order ${order._id}`);
        } else {
            console.log(`ℹ️ Stock not restored - order was in ${previousStatus} status (stock not deducted)`);
        }

        console.log(`✅ Refund processed successfully for order ${order._id}`);

    } catch (err) {
        console.error("❌ Error handling refund processed:", err);
    }
};

export { handleRazorpayWebhook };
