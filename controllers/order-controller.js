import Order from "../models/order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Payment from "../models/Payment.js";
import { calculateTotalAmount } from "../utils/utility.js";
import { razorpayInstance, verifyPaymentSignature } from "../utils/razorpay.js";

/**
 * Create Razorpay order (Step 1 - for online payment)
 */
const createRazorpayOrder = async (req, res) => {
    try {
        const { totalAmount, address } = req.body;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const calculatedAmount = calculateTotalAmount(cart.items);

        if (calculatedAmount !== totalAmount) {
            return res.status(400).json({ 
                success: false, 
                message: "Total amount mismatch" 
            });
        }

        // Check stock availability
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Product ${item.product.name} not found` 
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
                });
            }
        }

        // Create Razorpay order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: userId.toString(),
                cartId: cart._id.toString()
            }
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Create pending order in database
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
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
            paymentMethod: "Online",
            status: "Pending"
        });

        await order.save();

        // Create payment record
        const payment = new Payment({
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: totalAmount,
            currency: "INR",
            status: "created"
        });

        await payment.save();
        
      

        res.status(200).json({
            success: true,
            message: "Razorpay order created",
            razorpayOrder: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency
            },
            orderId: order._id,
            key: process.env.RAZORPAY_API_KEY
        });

    } catch (err) {
        console.error("Razorpay order creation failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create payment order", 
            error: err.message 
        });
    }
};

/**
 * Verify payment and complete order (Step 2 - after payment success)
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
        const userId = req.user._id;


        // Verify signature
        const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (!isValid) {
      
            return res.status(400).json({ 
                success: false, 
                message: "Invalid payment signature" 
            });
        }

      

        // Find order and payment
        const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
        const payment = await Payment.findOne({ orderId, razorpayOrderId });

      

        if (!order || !payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Order or payment not found" 
            });
        }

        // Update payment record
        payment.razorpayPaymentId = razorpayPaymentId;
        payment.razorpaySignature = razorpaySignature;
        payment.status = "captured";
        await payment.save();

     

        // Deduct stock
        for (const item of order.items) {
            const product = await Product.findById(item.product._id);
            if (product) {
                const oldStock = product.stock;
                product.stock -= item.quantity;
                await product.save();
             
            }
        }

  
        // Clear cart
        await Cart.findOneAndDelete({ user: userId });



        res.status(200).json({
            success: true,
            message: "Payment verified and order confirmed",
            order
        });

    } catch (err) {
        console.error("❌ Payment verification failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Payment verification failed", 
            error: err.message 
        });
    }
};

/**
 * Create COD order (for Cash on Delivery)
 */
const createOrder = async (req, res) => {
    try {
        const { totalAmount, address, paymentMethod } = req.body;
        const userId = req.user._id;

        // Only allow COD through this endpoint
        if (paymentMethod !== "COD") {
            return res.status(400).json({ 
                success: false, 
                message: "Use /create-razorpay-order for online payments" 
            });
        }

        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const getTotalAmount = calculateTotalAmount(cart.items);

        if (getTotalAmount !== totalAmount) {
            return res.status(400).json({ success: false, message: "Total amount is not correct" });
        }

        // Check stock availability and deduct stock
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            
            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: `Product ${item.product.name} not found` 
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
                });
            }

            // Deduct stock automatically
            product.stock -= item.quantity;
            await product.save();
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
            paymentMethod: "COD",
        });

        await order.save();
        await cart.deleteOne();

        res.status(201).json({ 
            success: true, 
            message: "Order created successfully. Stock updated.", 
            order 
        });
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ 
            success: false, 
            message: "Something went wrong", 
            error: err.message 
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { 
            page = 1, 
            limit = 10, 
            status, 
            paymentMethod, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;
        
        const skip = (page - 1) * limit;

        // Build query filters
        const query = { user: userId };

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by payment method
        if (paymentMethod) {
            query.paymentMethod = paymentMethod;
        }

        // Search by order ID or total amount
        if (search) {
            const searchConditions = [];
            
            // Check if search is a valid ObjectId format (24 hex characters)
            if (/^[0-9a-fA-F]{24}$/.test(search)) {
                searchConditions.push({ _id: search });
            }
            
            // Check if search is a number for amount search
            if (!isNaN(search) && search.trim() !== '') {
                searchConditions.push({ totalAmount: Number(search) });
            }
            
            // Only add $or if we have valid search conditions
            if (searchConditions.length > 0) {
                query.$or = searchConditions;
            }
        }

        // Build sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const orders = await Order.find(query)
            .populate('items.product')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);
            
        const totalOrders = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalOrders / limit);

        // Fetch payment details for each order
        const ordersWithPayments = await Promise.all(
            orders.map(async (order) => {
                const payment = await Payment.findOne({ orderId: order._id });
                return {
                    ...order.toObject(),
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
                };
            })
        );

        res.status(200).json({ 
            success: true, 
            orders: ordersWithPayments, 
            totalPages,
            currentPage: parseInt(page),
            totalOrders,
            filters: {
                status: status || 'all',
                paymentMethod: paymentMethod || 'all',
                search: search || '',
                sortBy,
                sortOrder
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId }).populate('items.product');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Fetch payment details
        const payment = await Payment.findOne({ orderId: order._id });

        res.status(200).json({ 
            success: true, 
            order: {
                ...order.toObject(),
                payment: payment ? {
                    _id: payment._id,
                    razorpayOrderId: payment.razorpayOrderId,
                    razorpayPaymentId: payment.razorpayPaymentId,
                    amount: payment.amount,
                    currency: payment.currency,
                    status: payment.status,
                    paymentMethod: payment.paymentMethod,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt
                } : null
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
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
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order updated successfully", order });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOneAndDelete({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * Get payment details for a specific order (User)
 */
const getPaymentDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        const payment = await Payment.findOne({ orderId });

        if (!payment) {
            return res.status(404).json({ 
                success: false, 
                message: "Payment details not found" 
            });
        }

        res.status(200).json({
            success: true,
            payment: {
                orderId: payment.orderId,
                razorpayOrderId: payment.razorpayOrderId,
                razorpayPaymentId: payment.razorpayPaymentId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                paymentMethod: payment.paymentMethod,
                createdAt: payment.createdAt,
                updatedAt: payment.updatedAt
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

/**
 * Cancel pending order (User can cancel if payment not completed)
 */
const cancelPendingOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Order not found" 
            });
        }

        // Only allow cancellation of pending orders
        if (order.status !== "Pending") {
            return res.status(400).json({ 
                success: false, 
                message: "Only pending orders can be cancelled" 
            });
        }

        // Check if payment is still in created status
        const payment = await Payment.findOne({ orderId: order._id });
        
        if (payment && payment.status !== "created") {
            return res.status(400).json({ 
                success: false, 
                message: "Payment already processed, cannot cancel" 
            });
        }

        // Update order status to Cancelled
        order.status = "Cancelled";
        await order.save();

        // Update payment status to failed if exists
        if (payment) {
            payment.status = "failed";
            await payment.save();
        }

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

/**
 * Get all payments for user
 */
const getUserPayments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Get all orders for user
        const orders = await Order.find({ user: userId })
            .select('_id')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const orderIds = orders.map(order => order._id);

        // Get payments for these orders
        const payments = await Payment.find({ orderId: { $in: orderIds } })
            .populate('orderId', 'totalAmount status paymentMethod address')
            .sort({ createdAt: -1 });

        const totalPayments = await Payment.countDocuments({ 
            orderId: { $in: await Order.find({ user: userId }).select('_id') } 
        });

        res.status(200).json({
            success: true,
            payments,
            currentPage: page,
            totalPages: Math.ceil(totalPayments / limit),
            totalPayments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};

export { 
    createOrder, 
    createRazorpayOrder, 
    verifyPayment, 
    getOrders, 
    getOrderById, 
    updateOrder, 
    deleteOrder,
    getPaymentDetails,
    getUserPayments,
    cancelPendingOrder,
    debugGetAllPayments,
    debugGetOrderWithPayment
};


/**
 * Debug endpoint - Get all payments (for testing)
 */
const debugGetAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('orderId')
            .sort({ createdAt: -1 })
            .limit(10);

        const paymentCount = await Payment.countDocuments();

        res.status(200).json({
            success: true,
            totalPayments: paymentCount,
            payments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};


/**
 * Debug endpoint - Get order with payment details
 */
const debugGetOrderWithPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const payment = await Payment.findOne({ orderId });

        res.status(200).json({
            success: true,
            order: {
                _id: order._id,
                status: order.status,
                paymentMethod: order.paymentMethod,
                totalAmount: order.totalAmount,
                user: order.user,
                items: order.items,
                createdAt: order.createdAt
            },
            payment: payment || null,
            hasPayment: !!payment,
            paymentStatus: payment ? payment.status : "No payment record"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
};
