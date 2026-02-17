import User from "../models/user.js";
import { createAdminToken } from "../utils/config.js";
import bcrypt from "bcryptjs";
import Product, { TSHIRT_CATEGORIES } from "../models/Product.js";
import Order from "../models/order.js";
import QR from "../models/QR.js";
import mongoose from "mongoose";
import { uploadFileToCloudinary } from "../utils/utility.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const admin = await User.findOne({ email }).select("+password");
  if (!admin) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid login credentials" });
  }
  if (!admin.isAdmin) {
    return res.status(400).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }
  const isPasswordCorrect = await bcrypt.compare(password, admin.password);
  if (!isPasswordCorrect) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }
  const token = createAdminToken(admin._id);
  res
    .status(200)
    .json({ success: true, message: "Admin logged in successfully", token });
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

    // Check if req.body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty or undefined",
        debug: {
          body: req.body,
          files: req.files,
          file: req.file,
          contentType: req.get('content-type')
        }
      });
    }

    const { name, price, description, category, sizes, stock, isFeatured } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    
    if (name !== undefined && name !== null && name !== "") updateData.name = name;
    if (price !== undefined && price !== null && price !== "") updateData.price = price;
    if (description !== undefined && description !== null && description !== "") updateData.description = description;
    
    // Validate category if provided
    if (category !== undefined && category !== null && category !== "") {
      if (!Object.values(TSHIRT_CATEGORIES).includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
        });
      }
      updateData.category = category;
    }
    
    // Handle sizes field
    if (sizes !== undefined && sizes !== null && sizes !== "") {
      if (Array.isArray(sizes)) {
        updateData.sizes = sizes.filter(Boolean);
      } else {
        try {
          const parsed = JSON.parse(sizes);
          updateData.sizes = Array.isArray(parsed) ? parsed.filter(Boolean) : [sizes.trim()];
        } catch {
          updateData.sizes = [sizes.trim()];
        }
      }
    }
    
    if (stock !== undefined && stock !== null && stock !== "") updateData.stock = stock;
    
    // Handle isFeatured field
    if (isFeatured !== undefined && isFeatured !== null) {
      if (typeof isFeatured === 'boolean') {
        updateData.isFeatured = isFeatured;
      } else if (typeof isFeatured === 'string') {
        const lowerValue = isFeatured.toLowerCase().trim();
        updateData.isFeatured = lowerValue === 'yes' || lowerValue === 'true' || lowerValue === '1';
      } else {
        updateData.isFeatured = Boolean(isFeatured);
      }
    }
    
    // Handle file uploads
    if (req.files && req.files.length > 0) {
      console.log("Processing uploaded files:", req.files);
      const cloudinaryUrls = await uploadFileToCloudinary(req.files);
      updateData.images = cloudinaryUrls;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
        receivedBody: req.body
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update product", 
      error: error.message,
      stack: error.stack
    });
  }
};

const deleteproduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndDelete(id);
  res
    .status(200)
    .json({ success: true, message: "Product deleted successfully" });
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || req.query.searchTerm || "";
    const filter = req.query.filter || "";
    const categoryFilter = req.query.category || "";

    // Build match conditions
    let matchConditions = {};

    // Handle status filtering
    if (filter && filter.toLowerCase().trim() !== "all") {
      let statusFilter;
      const filterLower = filter.toLowerCase().trim();
      
      switch (filterLower) {
        case "pending":
          statusFilter = "Pending";
          break;
        case "processing":
          statusFilter = "Processing";
          break;
        case "shipping":
        case "shipped":
          statusFilter = "Shipped";
          break;
        case "out for delivery":
        case "out of delivery":
        case "outfordelivery":
        case "out_for_delivery":
          statusFilter = "Out for Delivery";
          break;
        case "delivered":
          statusFilter = "Delivered";
          break;
        case "cancelled":
        case "canceled":
          statusFilter = "Cancelled";
          break;
        default:
          statusFilter = null;
      }
      
      if (statusFilter) {
        matchConditions.status = statusFilter;
      }
    }

    // Handle category filtering
    if (categoryFilter && Object.values(TSHIRT_CATEGORIES).includes(categoryFilter)) {
      matchConditions["items.category"] = categoryFilter;
    }

    const pipeline = [
      // First apply status filter if any
      ...(Object.keys(matchConditions).length > 0 ? [{ $match: matchConditions }] : []),

      // Populate user
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Populate products in items
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "populatedProducts",
        },
      },

      // Add populated products to items
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

      // Apply search filter
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

      // Sort by creation date (newest first)
      { $sort: { createdAt: -1 } },

      // For pagination and total count
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

    // Fetch QR image
    const qr = await QR.findOne();
    const qrImage = qr ? qr.qrImage : null;

    res.status(200).json({
      success: true,
      orders,
      qrImage,
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

    // Validate status if provided
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    const updateData = { ...otherUpdates };
    if (status) {
      updateData.status = status;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('user').populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order
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

    res.status(200).json({
      success: true,
      order
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

// Debug function to get order counts by status
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
    
    // Also get all unique statuses in the database
    const allStatuses = await Order.distinct("status");
    
    // Get some sample orders with their total amounts
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

// Test search functionality
const testSearch = async (req, res) => {
  try {
    const { testSearch } = req.query;
    
    // Test if we can find orders with the search term
    const directSearch = await Order.find({
      $or: [
        { totalAmount: { $regex: testSearch.toString(), $options: "i" } }
      ]
    }).select('_id totalAmount status').limit(5);
    
    // Test string conversion
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

const addQR = async (req, res) => {
  try {
    // Check if file is uploaded
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "QR image is required"
      });
    }

    // Handle single file from req.file or first file from req.files
    const file = req.file || (req.files && req.files[0]);
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "QR image file is required"
      });
    }

    // Upload file to Cloudinary
    const uploadedFiles = await uploadFileToCloudinary([file]);
    
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload QR image to Cloudinary"
      });
    }

    const qrImageData = uploadedFiles[0];

    // Check if QR already exists, if so update it, otherwise create new
    let qr = await QR.findOne();
    
    if (qr) {
      // Update existing QR
      qr.qrImage = qrImageData;
      await qr.save();
    } else {
      // Create new QR
      qr = await QR.create({
        qrImage: qrImageData
      });
    }

    res.status(200).json({
      success: true,
      message: "QR image uploaded successfully",
      qr
    });
  } catch (error) {
    console.error("Error uploading QR image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload QR image",
      error: error.message
    });
  }
};

export { 
  login, 
  getallproducts, 
  updateproduct, 
  deleteproduct, 
  getAllOrders, 
  updateOrderStatus, 
  deleteOrderByAdmin, 
  getOrderByIdAdmin, 
  getOrderStatistics, 
  testSearch, 
  addQR,
  // Inventory Management
  getInventoryOverview,
  getLowStockAlerts,
  updateProductStock,
  bulkUpdateStock,
  getCategoryInventoryAnalytics,
  getStockMovementReport,
  getProductsByCategory
};

// ==================== INVENTORY MANAGEMENT ====================

/**
 * Get inventory overview with category-wise breakdown
 */
const getInventoryOverview = async (req, res) => {
  try {
    const { category, lowStock, outOfStock } = req.query;
    const lowStockThreshold = parseInt(req.query.threshold) || 10;

    // Build filter
    let filter = {};
    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      filter.category = category;
    }
    if (lowStock === 'true') {
      filter.stock = { $lte: lowStockThreshold, $gt: 0 };
    }
    if (outOfStock === 'true') {
      filter.stock = 0;
    }

    // Get products with filters
    const products = await Product.find(filter).sort({ stock: 1 });

    // Category-wise statistics
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          averageStock: { $avg: "$stock" },
          lowStockCount: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ["$stock", lowStockThreshold] }, { $gt: ["$stock", 0] }] },
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
          },
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Overall statistics
    const overallStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          lowStockCount: {
            $sum: {
              $cond: [
                { $and: [{ $lte: ["$stock", lowStockThreshold] }, { $gt: ["$stock", 0] }] },
                1,
                0
              ]
            }
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] }
          },
          totalInventoryValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      products,
      categoryStats,
      overallStats: overallStats[0] || {},
      filters: { category, lowStock, outOfStock, threshold: lowStockThreshold }
    });
  } catch (error) {
    console.error("Error fetching inventory overview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory overview",
      error: error.message
    });
  }
};

/**
 * Get low stock alerts
 */
const getLowStockAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const category = req.query.category;

    let filter = {
      stock: { $lte: threshold, $gt: 0 }
    };

    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      filter.category = category;
    }

    const lowStockProducts = await Product.find(filter)
      .sort({ stock: 1 })
      .select('name category stock price images');

    const criticalStock = lowStockProducts.filter(p => p.stock <= 5);
    const warningStock = lowStockProducts.filter(p => p.stock > 5 && p.stock <= threshold);

    res.status(200).json({
      success: true,
      alerts: {
        critical: criticalStock,
        warning: warningStock,
        total: lowStockProducts.length
      },
      threshold
    });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock alerts",
      error: error.message
    });
  }
};

/**
 * Update stock for a single product
 */
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: "Stock value is required"
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let newStock;
    if (operation === 'add') {
      newStock = product.stock + parseInt(stock);
    } else if (operation === 'subtract') {
      newStock = Math.max(0, product.stock - parseInt(stock));
    } else {
      newStock = parseInt(stock);
    }

    product.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product
    });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message
    });
  }
};

/**
 * Bulk update stock for multiple products
 */
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required"
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const update of updates) {
      try {
        const { productId, stock, operation } = update;

        const product = await Product.findById(productId);
        if (!product) {
          results.failed.push({
            productId,
            reason: "Product not found"
          });
          continue;
        }

        let newStock;
        if (operation === 'add') {
          newStock = product.stock + parseInt(stock);
        } else if (operation === 'subtract') {
          newStock = Math.max(0, product.stock - parseInt(stock));
        } else {
          newStock = parseInt(stock);
        }

        product.stock = newStock;
        await product.save();

        results.success.push({
          productId,
          name: product.name,
          oldStock: product.stock,
          newStock
        });
      } catch (err) {
        results.failed.push({
          productId: update.productId,
          reason: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${results.success.length} products, ${results.failed.length} failed`,
      results
    });
  } catch (error) {
    console.error("Error in bulk stock update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message
    });
  }
};

/**
 * Get category-wise inventory analytics
 */
const getCategoryInventoryAnalytics = async (req, res) => {
  try {
    const { category } = req.query;

    let matchStage = {};
    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      matchStage.category = category;
    }

    const analytics = await Product.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: "$category",
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          averageStock: { $avg: "$stock" },
          minStock: { $min: "$stock" },
          maxStock: { $max: "$stock" },
          averagePrice: { $avg: "$price" },
          totalInventoryValue: { $sum: { $multiply: ["$stock", "$price"] } },
          featuredCount: {
            $sum: { $cond: ["$isFeatured", 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top selling categories from orders
    const topSellingCategories = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.category",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics,
      topSellingCategories
    });
  } catch (error) {
    console.error("Error fetching category analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

/**
 * Get stock movement report
 */
const getStockMovementReport = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let categoryFilter = {};
    if (category && Object.values(TSHIRT_CATEGORIES).includes(category)) {
      categoryFilter["items.category"] = category;
    }

    // Get sold items from orders
    const soldItems = await Order.aggregate([
      { $match: { ...dateFilter, status: { $ne: "Cancelled" } } },
      { $unwind: "$items" },
      ...(Object.keys(categoryFilter).length > 0 ? [{ $match: categoryFilter }] : []),
      {
        $group: {
          _id: {
            category: "$items.category",
            productId: "$items.product"
          },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          category: "$_id.category",
          productId: "$_id.productId",
          productName: "$productDetails.name",
          currentStock: "$productDetails.stock",
          totalSold: 1,
          revenue: 1
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    res.status(200).json({
      success: true,
      report: soldItems,
      filters: { startDate, endDate, category }
    });
  } catch (error) {
    console.error("Error generating stock movement report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message
    });
  }
};

/**
 * Get products by category for inventory management
 */
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!Object.values(TSHIRT_CATEGORIES).includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${Object.values(TSHIRT_CATEGORIES).join(", ")}`
      });
    }

    const products = await Product.find({ category }).sort({ stock: 1 });

    const categoryStats = {
      totalProducts: products.length,
      totalStock: products.reduce((sum, p) => sum + p.stock, 0),
      averageStock: products.length > 0 ? products.reduce((sum, p) => sum + p.stock, 0) / products.length : 0,
      lowStockCount: products.filter(p => p.stock <= 10 && p.stock > 0).length,
      outOfStockCount: products.filter(p => p.stock === 0).length,
      totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0)
    };

    res.status(200).json({
      success: true,
      category,
      products,
      stats: categoryStats
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

