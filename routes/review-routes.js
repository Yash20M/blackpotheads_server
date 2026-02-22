import express from "express";
import {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    adminGetAllReviews,
    adminDeleteReview
} from "../controllers/review-controller.js";
import { authMiddleware, adminMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews); // Get all reviews for a product

// User routes (authenticated)
router.post("/", authMiddleware, createReview); // Create a review
router.get("/my-reviews", authMiddleware, getUserReviews); // Get user's own reviews
router.put("/:reviewId", authMiddleware, updateReview); // Update own review
router.delete("/:reviewId", authMiddleware, deleteReview); // Delete own review

export default router;
