import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { calculateTotalAmount } from "../utils/utility.js";

const createOrder = async (req, res) => {
    try {
        const { totalAmount, address, paymentMethod } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const getTotalAmount = calculateTotalAmount(cart.items);

        if (getTotalAmount !== totalAmount) {
            return res.status(400).json({ message: "Total amount is not correct" });
        }

        // Create order items with category, size, and price
        const orderItems = cart.items.map((item) => ({
            product: item?.product?._id,
            category: item.category,
            size: item.size,
            quantity: item.quantity,
            price: item.priceSnapshot
        }));

        const order = new Order({
            user: userId,
            items: orderItems,
            totalAmount,
            address,
            paymentMethod,
        });

        await order.save();
        await cart.deleteOne();

        res.status(201).json({ success: true, message: "Order created", order });
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: userId }).populate('items.product').skip(skip).limit(limit).sort({ createdAt: -1 });
        const totalOrders = await Order.countDocuments({ user: userId });
        const totalPages = Math.ceil(totalOrders / limit);

        res.status(200).json({ orders, totalPages });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        const order = await Order.findOneAndUpdate(
            { _id: orderId, user: userId },
            updateData,
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order updated successfully", order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOneAndDelete({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

export { createOrder, getOrders, getOrderById, updateOrder, deleteOrder };