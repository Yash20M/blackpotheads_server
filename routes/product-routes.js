import express from "express";
import { createProducts, getProducts, getFeaturedProducts, getProductById, getAllProducts } from "../controllers/product-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";
import { uploadProductImages } from "../middlewares/multer.js";

const router = express.Router();

router.post("/products", adminMiddleware, uploadProductImages, createProducts);

// Get all products (must come before /:id to avoid conflicts)
router.get("/products", getAllProducts);

router.get("/products/category/:category", getProducts);

router.get("/products/featured", getFeaturedProducts);

router.get("/products/:id", getProductById);

export default router;
