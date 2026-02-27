import { Router } from "express";
import {
  createOffer,
  getAllOffersAdmin,
  getActiveOffers,
  getOfferById,
  updateOffer,
  deleteOffer,
  toggleOfferStatus
} from "../controllers/offer-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";
import { uploadSingle } from "../middlewares/multer.js";

const router = Router();

// Debug: Log when routes are registered
console.log("📋 Registering offer routes...");

// Public routes (for users) - /api/v1/offers/...
router.get("/offers/active", (req, res, next) => {
    console.log("✅ /offers/active route hit - NO AUTH REQUIRED");
    next();
}, getActiveOffers);

router.get("/offers/:offerId", getOfferById);

console.log("✅ Offer routes registered successfully");

export default router;
