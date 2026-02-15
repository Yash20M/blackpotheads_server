import express from "express";
import { createProducts, getProducts, getFeaturedProducts, getProductById, getAllProducts, getQR } from "../controllers/product-controller.js";
import { adminMiddleware, authMiddleware } from "../middlewares/auth-middleware.js";
import { uploadProductImages } from "../middlewares/multer.js";

const router = express.Router();

router.post("/products", adminMiddleware, uploadProductImages, createProducts);

router.get("/products/category/:category", getProducts);

router.get("/products/featured", getFeaturedProducts);

router.get("/products", getAllProducts);

router.get("/products/:id", getProductById);

router.get("/get-qr", authMiddleware, getQR);




export default router;