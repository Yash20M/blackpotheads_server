import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/order.js";
import Payment from "./models/Payment.js";

dotenv.config();

const testOrderWithPayment = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB\n");

        // Find an online order
        const onlineOrder = await Order.findOne({ paymentMethod: "Online" })
            .populate('user', 'name email')
            .populate('items.product');

        if (!onlineOrder) {
            console.log("❌ No online orders found");
            await mongoose.connection.close();
            return;
        }

        console.log("📦 Order Found:");
        console.log("   ID:", onlineOrder._id);
        console.log("   Status:", onlineOrder.status);
        console.log("   Payment Method:", onlineOrder.paymentMethod);
        console.log("   Total Amount:", onlineOrder.totalAmount);
        console.log("   User:", onlineOrder.user.name, `(${onlineOrder.user.email})`);

        // Find payment for this order
        const payment = await Payment.findOne({ orderId: onlineOrder._id });

        if (payment) {
            console.log("\n💳 Payment Details:");
            console.log("   Payment ID:", payment._id);
            console.log("   Razorpay Order ID:", payment.razorpayOrderId);
            console.log("   Razorpay Payment ID:", payment.razorpayPaymentId || "Not yet paid");
            console.log("   Amount:", payment.amount);
            console.log("   Currency:", payment.currency);
            console.log("   Status:", payment.status);
            console.log("   Payment Method:", payment.paymentMethod || "Not specified");
            console.log("   Created:", payment.createdAt);
            console.log("   Updated:", payment.updatedAt);
        } else {
            console.log("\n❌ No payment record found for this order");
        }

        // Simulate API response
        console.log("\n📡 API Response Format:");
        const apiResponse = {
            success: true,
            order: {
                _id: onlineOrder._id,
                status: onlineOrder.status,
                paymentMethod: onlineOrder.paymentMethod,
                totalAmount: onlineOrder.totalAmount,
                user: {
                    name: onlineOrder.user.name,
                    email: onlineOrder.user.email
                },
                items: onlineOrder.items.map(item => ({
                    product: item.product.name,
                    category: item.category,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment: payment ? {
                    _id: payment._id,
                    razorpayOrderId: payment.razorpayOrderId,
                    razorpayPaymentId: payment.razorpayPaymentId,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod,
                    createdAt: payment.createdAt
                } : null
            }
        };

        console.log(JSON.stringify(apiResponse, null, 2));

        await mongoose.connection.close();
        console.log("\n✅ Test completed successfully");

    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    }
};

testOrderWithPayment();
