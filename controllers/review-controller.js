import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/order.js";

/**
 * Create a review (User only)
 */
const createReview = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!productId || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: "Product ID, rating, and comment are required"
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product. Use update instead."
            });
        }

        // Check if user purchased this product (verified purchase)
        const hasPurchased = await Order.findOne({
            user: userId,
            "items.product": productId,
            status: { $in: ["Processing", "Shipped", "Delivered"] }
        });

        const review = new Review({
            product: productId,
            user: userId,
            rating,
            comment,
            isVerifiedPurchase: !!hasPurchased
        });

        await review.save();

        // Populate user details
        await review.populate("user", "name email");

        res.status(201).json({
            success: true,
            message: "Review created successfully",
            review
        });
    } catch (err) {
        console.error("Create review error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to create review",
            error: err.message
        });
    }
};

/**
 * Get all reviews for a product
 */
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const skip = (page - 1) * limit;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const reviews = await Review.find({ product: productId })
            .populate("user", "name email")
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);

        const totalReviews = await Review.countDocuments({ product: productId });

        // Calculate average rating
        const ratingStats = await Review.aggregate([
            { $match: { product: product._id } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                    fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                    fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / limit),
            stats: ratingStats.length > 0 ? {
                averageRating: ratingStats[0].averageRating.toFixed(1),
                totalReviews: ratingStats[0].totalReviews,
                distribution: {
                    5: ratingStats[0].fiveStars,
                    4: ratingStats[0].fourStars,
                    3: ratingStats[0].threeStars,
                    2: ratingStats[0].twoStars,
                    1: ratingStats[0].oneStar
                }
            } : {
                averageRating: 0,
                totalReviews: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            }
        });
    } catch (err) {
        console.error("Get product reviews error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
            error: err.message
        });
    }
};

/**
 * Get user's own reviews
 */
const getUserReviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: userId })
            .populate("product", "name images price category")
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const totalReviews = await Review.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / limit)
        });
    } catch (err) {
        console.error("Get user reviews error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
            error: err.message
        });
    }
};

/**
 * Update a review (User can only update their own)
 */
const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await Review.findOne({ _id: reviewId, user: userId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you don't have permission to update it"
            });
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        await review.save();
        await review.populate("user", "name email");

        res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });
    } catch (err) {
        console.error("Update review error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: err.message
        });
    }
};

/**
 * Delete a review (User can only delete their own)
 */
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found or you don't have permission to delete it"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (err) {
        console.error("Delete review error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: err.message
        });
    }
};

/**
 * Admin: Get all reviews with filters
 */
const adminGetAllReviews = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            rating, 
            productId,
            isVerifiedPurchase,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const skip = (page - 1) * limit;

        const query = {};
        if (rating) query.rating = parseInt(rating);
        if (productId) query.product = productId;
        if (isVerifiedPurchase !== undefined) query.isVerifiedPurchase = isVerifiedPurchase === "true";

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

        const reviews = await Review.find(query)
            .populate("user", "name email")
            .populate("product", "name images category")
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOptions);

        const totalReviews = await Review.countDocuments(query);

        res.status(200).json({
            success: true,
            reviews,
            totalReviews,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalReviews / limit)
        });
    } catch (err) {
        console.error("Admin get all reviews error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
            error: err.message
        });
    }
};

/**
 * Admin: Delete any review
 */
const adminDeleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });
    } catch (err) {
        console.error("Admin delete review error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: err.message
        });
    }
};

export {
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    adminGetAllReviews,
    adminDeleteReview
};
