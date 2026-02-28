import express from "express";
import { createProducts, getProducts, getFeaturedProducts, getProductById, getAllProducts } from "../controllers/product-controller.js";
import { adminMiddleware, optionalAuthMiddleware } from "../middlewares/auth-middleware.js";
import { uploadProductImages } from "../middlewares/multer.js";

const router = express.Router();

router.post("/products", adminMiddleware, uploadProductImages, createProducts);

// Get all products (must come before /:id to avoid conflicts)
router.get("/products", optionalAuthMiddleware, getAllProducts);

router.get("/products/category/:category", optionalAuthMiddleware, getProducts);

router.get("/products/featured", optionalAuthMiddleware, getFeaturedProducts);

router.get("/products/:id", optionalAuthMiddleware, getProductById);

export default router;
