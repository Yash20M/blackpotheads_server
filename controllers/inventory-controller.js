import Product from "../models/Product.js";
import Order from "../models/order.js";
import { TSHIRT_CATEGORIES } from "../models/Product.js";

// Get comprehensive category-based inventory analytics
const getCategoryInventory = async (req, res) => {
  try {
    const categoryStats = [];

    for (const category of Object.values(TSHIRT_CATEGORIES)) {
      // Get all products in this category
      const products = await Product.find({ category });
      
      // Calculate total stock for category
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const totalProducts = products.length;
      const avgStock = totalProducts > 0 ? totalStock / totalProducts : 0;
      
      // Get low stock and out of stock counts
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
      const outOfStockProducts = products.filter(p => p.stock === 0).length;
      
      // Calculate total inventory value for category
      const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      
      // Get sales data for this category (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const salesData = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $ne: 'Cancelled' }
          }
        },
        { $unwind: "$items" },
        {
          $match: { "items.category": category }
        },
        {
          $group: {
            _id: null,
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            orderCount: { $sum: 1 }
          }
        }
      ]);

      const sales = salesData[0] || { totalSold: 0, totalRevenue: 0, orderCount: 0 };

      categoryStats.push({
        category,
        totalStock,
        totalProducts,
        avgStock: Math.round(avgStock * 100) / 100,
        lowStockProducts,
        outOfStockProducts,
        inStockProducts: totalProducts - outOfStockProducts,
        totalValue,
        last30Days: {
          unitsSold: sales.totalSold,
          revenue: sales.totalRevenue,
          orders: sales.orderCount
        },
        stockHealth: outOfStockProducts === 0 && lowStockProducts === 0 ? 'Healthy' : 
                     outOfStockProducts > 0 ? 'Critical' : 'Warning'
      });
    }

    // Overall summary
    const overallSummary = {
      totalCategories: categoryStats.length,
      totalStock: categoryStats.reduce((sum, cat) => sum + cat.totalStock, 0),
      totalProducts: categoryStats.reduce((sum, cat) => sum + cat.totalProducts, 0),
      totalValue: categoryStats.reduce((sum, cat) => sum + cat.totalValue, 0),
      healthyCategories: categoryStats.filter(cat => cat.stockHealth === 'Healthy').length,
      criticalCategories: categoryStats.filter(cat => cat.stockHealth === 'Critical').length
    };

    res.status(200).json({
      success: true,
      summary: overallSummary,
      categories: categoryStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category inventory",
      error: error.message
    });
  }
};

// Get inventory overview with stock levels
const getInventoryOverview = async (req, res) => {
  try {
    const { lowStock = 10, category } = req.query;
    
    const query = category ? { category } : {};
    
    const products = await Product.find(query)
      .select('name category stock sizes images')
      .sort({ stock: 1 });

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock <= parseInt(lowStock));
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    res.status(200).json({
      success: true,
      summary: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        totalStockValue
      },
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        sizes: p.sizes,
        image: p.images[0]?.url || null,
        stockStatus: p.stock === 0 ? 'Out of Stock' : p.stock <= parseInt(lowStock) ? 'Low Stock' : 'In Stock'
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory overview",
      error: error.message
    });
  }
};

// Update stock for a single product
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body;

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
    switch (operation) {
      case 'add':
        newStock = product.stock + parseInt(stock);
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - parseInt(stock));
        break;
      case 'set':
      default:
        newStock = parseInt(stock);
    }

    product.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      product: {
        _id: product._id,
        name: product.name,
        previousStock: operation === 'set' ? null : product.stock - newStock + product.stock,
        currentStock: product.stock
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message
    });
  }
};

// Bulk stock update
const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required with format: [{ productId, stock, operation }]"
      });
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { productId, stock, operation = 'set' } = update;
        
        const product = await Product.findById(productId);
        if (!product) {
          errors.push({ productId, error: "Product not found" });
          continue;
        }

        let newStock;
        switch (operation) {
          case 'add':
            newStock = product.stock + parseInt(stock);
            break;
          case 'subtract':
            newStock = Math.max(0, product.stock - parseInt(stock));
            break;
          case 'set':
          default:
            newStock = parseInt(stock);
        }

        product.stock = newStock;
        await product.save();

        results.push({
          productId: product._id,
          name: product.name,
          stock: product.stock
        });
      } catch (err) {
        errors.push({ productId: update.productId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Updated ${results.length} products`,
      updated: results,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to bulk update stock",
      error: error.message
    });
  }
};

// Get low stock products
const getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10, page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { stock: { $lte: parseInt(threshold), $gt: 0 } };
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select('name category stock price sizes images')
      .sort({ stock: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        price: p.price,
        sizes: p.sizes,
        image: p.images[0]?.url || null
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
      error: error.message
    });
  }
};

// Get out of stock products
const getOutOfStockProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const query = { stock: 0 };
    
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .select('name category stock price sizes images')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProducts: total,
      products: products.map(p => ({
        _id: p._id,
        name: p.name,
        category: p.category,
        stock: p.stock,
        price: p.price,
        sizes: p.sizes,
        image: p.images[0]?.url || null
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch out of stock products",
      error: error.message
    });
  }
};

// Get inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10, $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    
    // Get stock by category
    const stockByCategory = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          totalStock: { $sum: "$stock" },
          productCount: { $sum: 1 },
          avgStock: { $avg: "$stock" }
        }
      },
      { $sort: { totalStock: -1 } }
    ]);

    // Get total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } }
        }
      }
    ]);

    // Get recent stock movements (products updated in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUpdates = await Product.find({
      updatedAt: { $gte: sevenDaysAgo }
    })
      .select('name stock updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        inStockProducts: totalProducts - outOfStockProducts,
        totalInventoryValue: inventoryValue[0]?.totalValue || 0,
        stockByCategory,
        recentUpdates: recentUpdates.map(p => ({
          _id: p._id,
          name: p.name,
          stock: p.stock,
          lastUpdated: p.updatedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
      error: error.message
    });
  }
};

// Get stock movement report (based on orders)
const getStockMovementReport = async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    
    const matchStage = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.createdAt = dateFilter;
    }
    if (productId) {
      matchStage['items.product'] = productId;
    }

    const stockMovement = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$items" },
      ...(productId ? [{ $match: { 'items.product': productId } }] : []),
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          productName: "$product.name",
          category: "$product.category",
          currentStock: "$product.stock",
          totalQuantitySold: 1,
          totalRevenue: 1,
          orderCount: 1
        }
      },
      { $sort: { totalQuantitySold: -1 } }
    ]);

    res.status(200).json({
      success: true,
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Present'
      },
      stockMovement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movement report",
      error: error.message
    });
  }
};

// Get real-time stock alerts
const getStockAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Check for out of stock products
    const outOfStock = await Product.find({ stock: 0 })
      .select('name category stock images')
      .sort({ updatedAt: -1 });

    outOfStock.forEach(product => {
      alerts.push({
        type: 'critical',
        priority: 'high',
        message: `${product.name} is out of stock`,
        category: product.category,
        product: {
          _id: product._id,
          name: product.name,
          stock: product.stock,
          image: product.images[0]?.url
        },
        action: 'Restock immediately'
      });
    });

    // Check for low stock products
    const lowStock = await Product.find({ stock: { $gt: 0, $lte: 10 } })
      .select('name category stock images')
      .sort({ stock: 1 });

    lowStock.forEach(product => {
      alerts.push({
        type: 'warning',
        priority: 'medium',
        message: `${product.name} has low stock (${product.stock} units)`,
        category: product.category,
        product: {
          _id: product._id,
          name: product.name,
          stock: product.stock,
          image: product.images[0]?.url
        },
        action: 'Consider restocking'
      });
    });

    // Check for categories with critical stock
    for (const category of Object.values(TSHIRT_CATEGORIES)) {
      const categoryProducts = await Product.find({ category });
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const outOfStockCount = categoryProducts.filter(p => p.stock === 0).length;

      if (outOfStockCount > categoryProducts.length / 2) {
        alerts.push({
          type: 'critical',
          priority: 'high',
          message: `${category} category has ${outOfStockCount} out of ${categoryProducts.length} products out of stock`,
          category: category,
          action: 'Review category inventory'
        });
      }
    }

    res.status(200).json({
      success: true,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.type === 'critical').length,
      warningAlerts: alerts.filter(a => a.type === 'warning').length,
      alerts: alerts.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock alerts",
      error: error.message
    });
  }
};

// Get inventory trends and predictions
const getInventoryTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get daily sales trend
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Get category-wise sales trend
    const categorySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
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

    // Calculate average daily sales
    const avgDailySales = dailySales.length > 0 
      ? dailySales.reduce((sum, day) => sum + day.totalOrders, 0) / dailySales.length 
      : 0;

    // Get top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          status: { $ne: 'Cancelled' }
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          category: "$product.category",
          currentStock: "$product.stock",
          totalSold: 1,
          totalRevenue: 1,
          daysUntilStockout: {
            $cond: {
              if: { $gt: ["$totalSold", 0] },
              then: {
                $multiply: [
                  { $divide: ["$product.stock", { $divide: ["$totalSold", parseInt(days)] }] },
                  1
                ]
              },
              else: 999
            }
          }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      period: `Last ${days} days`,
      trends: {
        avgDailyOrders: Math.round(avgDailySales * 100) / 100,
        dailySales: dailySales.map(day => ({
          date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
          orders: day.totalOrders,
          revenue: day.totalRevenue
        })),
        categorySales: categorySales.map(cat => ({
          category: cat._id,
          unitsSold: cat.totalSold,
          revenue: cat.totalRevenue
        })),
        topSellingProducts: topProducts.map(p => ({
          productId: p.productId,
          name: p.name,
          category: p.category,
          currentStock: p.currentStock,
          unitsSold: p.totalSold,
          revenue: p.totalRevenue,
          estimatedDaysUntilStockout: Math.round(p.daysUntilStockout),
          needsRestock: p.daysUntilStockout < 7
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory trends",
      error: error.message
    });
  }
};

export {
  getInventoryOverview,
  updateProductStock,
  bulkUpdateStock,
  getLowStockProducts,
  getOutOfStockProducts,
  getInventoryStats,
  getStockMovementReport,
  getCategoryInventory,
  getStockAlerts,
  getInventoryTrends
};
