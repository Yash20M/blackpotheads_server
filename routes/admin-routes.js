import { Router } from "express";
import {
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
} from "../controllers/admin-controller.js";
import {
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
} from "../controllers/inventory-controller.js";
import {
  createOffer,
  getAllOffersAdmin,
  updateOffer,
  deleteOffer,
  toggleOfferStatus
} from "../controllers/offer-controller.js";
import {
  adminGetAllReviews,
  adminDeleteReview
} from "../controllers/review-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";
import { uploadMultiple, uploadProductImages, uploadSingle } from "../middlewares/multer.js";
import { createProducts } from "../controllers/product-controller.js";

const router = Router();

router.post("/login", login);
router.put("/change-password", adminMiddleware, changePassword);
router.post("/add-product", adminMiddleware, uploadMultiple, createProducts);
router.get("/get-all-products", adminMiddleware, getallproducts);
router.put("/update-product/:id", adminMiddleware, uploadProductImages, updateproduct);
router.delete("/delete-product/:id", adminMiddleware, deleteproduct);

// Order management routes
router.get("/get-all-orders", adminMiddleware, getAllOrders);
router.get("/get-order/:orderId", adminMiddleware, getOrderByIdAdmin);
router.put("/update-order/:orderId", adminMiddleware, updateOrderStatus);
router.delete("/delete-order/:orderId", adminMiddleware, deleteOrderByAdmin);
router.get("/order-statistics", adminMiddleware, getOrderStatistics);
router.post("/cleanup-abandoned-orders", adminMiddleware, cleanupAbandonedOrders);
router.get("/test-search", adminMiddleware, testSearch);

// Inventory management routes
router.get("/inventory/overview", adminMiddleware, getInventoryOverview);
router.get("/inventory/stats", adminMiddleware, getInventoryStats);
router.get("/inventory/categories", adminMiddleware, getCategoryInventory);
router.get("/inventory/alerts", adminMiddleware, getStockAlerts);
router.get("/inventory/trends", adminMiddleware, getInventoryTrends);
router.get("/inventory/low-stock", adminMiddleware, getLowStockProducts);
router.get("/inventory/out-of-stock", adminMiddleware, getOutOfStockProducts);
router.get("/inventory/stock-movement", adminMiddleware, getStockMovementReport);
router.put("/inventory/update-stock/:id", adminMiddleware, updateProductStock);
router.put("/inventory/bulk-update-stock", adminMiddleware, bulkUpdateStock);

// Payment management routes
router.get("/payments", adminMiddleware, getAllPayments);
router.get("/payments/:paymentId", adminMiddleware, getPaymentById);
router.get("/payment-statistics", adminMiddleware, getPaymentStatistics);

// Offer management routes
router.post("/offers", adminMiddleware, uploadSingle, createOffer);
router.get("/offers", adminMiddleware, getAllOffersAdmin);
router.put("/offers/:offerId", adminMiddleware, uploadSingle, updateOffer);
router.delete("/offers/:offerId", adminMiddleware, deleteOffer);
router.patch("/offers/:offerId/toggle", adminMiddleware, toggleOfferStatus);

// Review management routes
router.get("/reviews", adminMiddleware, adminGetAllReviews);
router.delete("/reviews/:reviewId", adminMiddleware, adminDeleteReview);

export default router;
