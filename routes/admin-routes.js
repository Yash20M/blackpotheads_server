import { Router } from "express";
import {
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
} from "../controllers/admin-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";
import { uploadMultiple, uploadProductImages, uploadQR } from "../middlewares/multer.js";
import { createProducts } from "../controllers/product-controller.js";

const router = Router();

router.post("/login", login);
router.post("/add-product", adminMiddleware, uploadMultiple, createProducts);
router.post("/add-qr", adminMiddleware, uploadQR, addQR);
router.get("/get-all-products", adminMiddleware, getallproducts);
router.put("/update-product/:id", adminMiddleware, uploadProductImages, updateproduct);
router.delete("/delete-product/:id", adminMiddleware, deleteproduct);

// Order management routes
router.get("/get-all-orders", adminMiddleware, getAllOrders);
router.get("/get-order/:orderId", adminMiddleware, getOrderByIdAdmin);
router.put("/update-order/:orderId", adminMiddleware, updateOrderStatus);
router.delete("/delete-order/:orderId", adminMiddleware, deleteOrderByAdmin);
router.get("/order-statistics", adminMiddleware, getOrderStatistics);
router.get("/test-search", adminMiddleware, testSearch);

export default router;
