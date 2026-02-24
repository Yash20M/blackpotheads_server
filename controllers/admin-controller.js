import User from "../models/user.js";
import { createAdminToken } from "../utils/config.js";
import bcrypt from "bcryptjs";
import Product, { TSHIRT_CATEGORIES } from "../models/Product.js";
import Order from "../models/order.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";
import { uploadFileToCloudinary } from "../utils/utility.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await User.findOne({ email }).select("+password");
  if (!admin) {
    return res.status(400).json({ success: false, message: "Invalid login credentials" });
  }
  if (!admin.isAdmin) {
    return res.status(400).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ success: false, message: "Invalid credentials" });
  }
  const token = createAdminToken(admin._id);
  res.status(200).json({ success: true, message: "Admin logged in successfully", token });
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin._id;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match"
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long"
      });
    }

    // Get admin with password
    const admin = await User.findById(adminId).select("+password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Set new password (will be hashed by pre-save hook)
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message
    });
  }
};

const getallproducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const updateproduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty or undefined"
      });
    }

    const { name, price, description, category, sizes, stock, isFeatured } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (price) updateData.price = price;
    if (description) updateData.description = description;
    
    if (category) {
      if (!Object.values(TSHIRT_CATEGORIES).includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
        });
      }
      updateData.category = category;
    }
    
    if (sizes) {
      updateData.sizes = Array.isArray(sizes) ? sizes.filter(Boolean) : [sizes];
    }
    
    if (stock !== undefined) updateData.stock = stock;
    
    if (isFeatured !== undefined) {
      updateData.isFeatured = typeof isFeatured === 'boolean' ? isFeatured : 
                              isFeatured === 'true' || isFeatured === 'yes' || isFeatured === '1';
    }
    
    if (req.files && req.files.length > 0) {
      const cloudinaryUrls = await uploadFileToCloudinary(req.files);
      updateData.images = cloudinaryUrls;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update"
      });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update product", 
      error: error.message
    });
  }
};

const deleteproduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res.status(200).json({ success: true, message: "Product deleted successfully" });
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || req.query.searchTerm || "";
    const filter = req.query.filter || "";
    const categoryFilter = req.query.category || "";

    let matchConditions = {};

    if (filter && filter.toLowerCase().trim() !== "all") {
      const filterLower = filter.toLowerCase().trim();
      const statusMap = {
        "pending": "Pending",
        "processing": "Processing",
        "shipping": "Shipped",
        "shipped": "Shipped",
        "out for delivery": "Out for Delivery",
        "out of delivery": "Out for Delivery",
        "outfordelivery": "Out for Delivery",
        "out_for_delivery": "Out for Delivery",
        "delivered": "Delivered",
        "cancelled": "Cancelled",
        "canceled": "Cancelled"
      };
      
      if (statusMap[filterLower]) {
        matchConditions.status = statusMap[filterLower];
      }
    }

    if (categoryFilter && Object.values(TSHIRT_CATEGORIES).includes(categoryFilter)) {
      matchConditions["items.category"] = categoryFilter;
    }

    const pipeline = [
      ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "populatedProducts",
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    product: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$populatedProducts",
                            cond: { $eq: ["$$this._id", "$$item.product"] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      ...(search ? [{
        $match: {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "items.product.name": { $regex: search, $options: "i" } },
            { "items.category": { $regex: search, $options: "i" } },
            { "status": { $regex: search, $options: "i" } },
            { "paymentMethod": { $regex: search, $options: "i" } },
            ...(mongoose.Types.ObjectId.isValid(search) && search.match(/^[0-9a-fA-F]{24}$/) ? [{ "_id": new mongoose.Types.ObjectId(search) }] : []),
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: "$totalAmount" },
                  regex: search,
                  options: "i"
                }
              }
            },
            { "address.line1": { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.state": { $regex: search, $options: "i" } },
            { "address.pincode": { $regex: search, $options: "i" } },
            { "address.country": { $regex: search, $options: "i" } }
          ]
        }
      }] : []),
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await Order.aggregate(pipeline);
    const orders = result[0].data;
    const totalOrders = result[0].total[0]?.count || 0;

    // Fetch payment details for each order
    const ordersWithPayments = await Promise.all(
      orders.map(async (order) => {
        const payment = await Payment.findOne({ orderId: order._id });
        
        // Check if payment is pending (order is Online but payment not captured)
        const isPaymentPending = order.paymentMethod === "Online" && 
                                 (!payment || payment.status !== "captured");
        
        return {
          ...order,
          payment: payment ? {
            _id: payment._id,
            razorpayOrderId: payment.razorpayOrderId,
            razorpayPaymentId: payment.razorpayPaymentId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            createdAt: payment.createdAt
          } : null,
          paymentWarning: isPaymentPending ? "PAYMENT_PENDING" : null
        };
      })
    );

    res.status(200).json({
      success: true,
      orders: ordersWithPayments,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      appliedFilters: {
        search,
        filter,
        category: categoryFilter
      }
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, ...otherUpdates } = req.body;

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    const updateData = { ...otherUpdates };
    if (status) {
      updateData.status = status;
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user').populate('items.product');

    res.status(200).json({
      success: true,
      message: status === 'Cancelled' ? "Order cancelled and stock restored" : "Order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
      error: error.message
    });
  }
};

const deleteOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message
    });
  }
};

const getOrderByIdAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Fetch payment details
    const payment = await Payment.findOne({ orderId: order._id });

    // Check if payment is pending
    const isPaymentPending = order.paymentMethod === "Online" && 
                             (!payment || payment.status !== "captured");

    res.status(200).json({
      success: true,
      order: {
        ...order.toObject(),
        payment: payment ? {
          _id: payment._id,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpaySignature: payment.razorpaySignature,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt
        } : null,
        paymentWarning: isPaymentPending ? "PAYMENT_PENDING" : null
      }
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message
    });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];

    const statusCounts = await Order.aggregate(pipeline);
    const allStatuses = await Order.distinct("status");
    const sampleOrders = await Order.find({})
      .select('_id totalAmount status')
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      statusCounts,
      allStatuses,
      totalOrders: await Order.countDocuments(),
      sampleOrders
    });
  } catch (error) {
    console.error("Error getting order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get order statistics",
      error: error.message
    });
  }
};

const testSearch = async (req, res) => {
  try {
    const { testSearch } = req.query;
    
    const directSearch = await Order.find({
      $or: [
        { totalAmount: { $regex: testSearch.toString(), $options: "i" } }
      ]
    }).select('_id totalAmount status').limit(5);
    
    const stringSearch = await Order.aggregate([
      {
        $match: {
          $expr: {
            $regexMatch: {
              input: { $toString: "$totalAmount" },
              regex: testSearch,
              options: "i"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          totalAmount: 1,
          status: 1,
          totalAmountAsString: { $toString: "$totalAmount" }
        }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      searchTerm: testSearch,
      directSearch,
      stringSearch,
      totalOrdersInDB: await Order.countDocuments()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test search failed",
      error: error.message
    });
  }
};

export { 
  login,
  changePassword,
  getallproducts, 
  updateproduct, 
  deleteproduct, 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrderByAdmin, 
  getOrderByIdAdmin, 
  getOrderStatistics, 
  testSearch,
  getAllPayments,
  getPaymentById,
  getPaymentStatistics,
  cleanupAbandonedOrders
};


/**
 * Get all payments with filters (Admin)
 */
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const userId = req.query.userId;

    let matchConditions = {};

    if (status && status.toLowerCase() !== "all") {
      matchConditions.status = status;
    }

    if (startDate || endDate) {
      matchConditions.createdAt = {};
      if (startDate) {
        matchConditions.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchConditions.createdAt.$lte = new Date(endDate);
      }
    }

    if (userId) {
      const orders = await Order.find({ user: userId }).select('_id');
      const orderIds = orders.map(order => order._id);
      matchConditions.orderId = { $in: orderIds };
    }

    const payments = await Payment.find(matchConditions)
      .populate({
        path: 'orderId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPayments = await Payment.countDocuments(matchConditions);

    res.status(200).json({
      success: true,
      payments,
      currentPage: page,
      totalPages: Math.ceil(totalPayments / limit),
      totalPayments,
      appliedFilters: {
        status,
        startDate,
        endDate,
        userId
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message
    });
  }
};

/**
 * Get specific payment by ID (Admin)
 */
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'orderId',
        populate: [
          { path: 'user', select: 'name email phone' },
          { path: 'items.product' }
        ]
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    res.status(200).json({
      success: true,
      payment
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message
    });
  }
};

/**
 * Get payment statistics (Admin)
 */
const getPaymentStatistics = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments();
    
    const statusBreakdown = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: { $in: ["captured", "authorized"] } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const successfulPayments = await Payment.countDocuments({ 
      status: { $in: ["captured", "authorized"] } 
    });
    
    const failedPayments = await Payment.countDocuments({ status: "failed" });
    
    const successRate = totalPayments > 0 
      ? ((successfulPayments / totalPayments) * 100).toFixed(2) 
      : 0;

    const recentPayments = await Payment.find()
      .populate({
        path: 'orderId',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      statistics: {
        totalPayments,
        successfulPayments,
        failedPayments,
        successRate: `${successRate}%`,
        totalRevenue: totalRevenue[0]?.total || 0,
        statusBreakdown,
        recentPayments
      }
    });
  } catch (error) {
    console.error("Error fetching payment statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment statistics",
      error: error.message
    });
  }
};


/**
 * Clean up abandoned orders (orders pending for more than 24 hours)
 */
const cleanupAbandonedOrders = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Find pending orders older than 24 hours
    const abandonedOrders = await Order.find({
      status: "Pending",
      paymentMethod: "Online",
      createdAt: { $lt: twentyFourHoursAgo }
    });

    let cleanedCount = 0;

    for (const order of abandonedOrders) {
      // Check if payment is still in created status
      const payment = await Payment.findOne({ orderId: order._id });
      
      if (payment && payment.status === "created") {
        // Mark order as cancelled
        order.status = "Cancelled";
        await order.save();

        // Mark payment as failed
        payment.status = "failed";
        await payment.save();

        cleanedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} abandoned orders`,
      cleanedCount
    });
  } catch (error) {
    console.error("Error cleaning up abandoned orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup abandoned orders",
      error: error.message
    });
  }
};
