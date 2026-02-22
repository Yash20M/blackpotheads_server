import mongoose from "mongoose";
import dotenv from "dotenv";
import Payment from "./models/Payment.js";
import Order from "./models/order.js";

dotenv.config();

const testPaymentCreation = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Check if Payment collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const paymentCollection = collections.find(c => c.name === 'payments');
        console.log("💳 Payment collection exists:", !!paymentCollection);

        // Count existing payments
        const paymentCount = await Payment.countDocuments();
        console.log("📊 Total payments in database:", paymentCount);

        // Get all payments
        const payments = await Payment.find().limit(5);
        console.log("💰 Sample payments:", JSON.stringify(payments, null, 2));

        // Count orders
        const orderCount = await Order.countDocuments();
        console.log("📦 Total orders in database:", orderCount);

        // Get orders with Online payment method
        const onlineOrders = await Order.find({ paymentMethod: "Online" }).limit(5);
        console.log("🌐 Online orders:", onlineOrders.length);

        if (onlineOrders.length > 0) {
            console.log("Sample online order:", JSON.stringify(onlineOrders[0], null, 2));
            
            // Check if payment exists for this order
            const payment = await Payment.findOne({ orderId: onlineOrders[0]._id });
            console.log("Payment for this order:", payment ? "EXISTS" : "NOT FOUND");
        }

        await mongoose.connection.close();
        console.log("✅ Test completed");

    } catch (err) {
        console.error("❌ Test failed:", err);
        process.exit(1);
    }
};

testPaymentCreation();
