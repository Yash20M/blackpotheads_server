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

// Public routes (for users) - /api/v1/offers/...
router.get("/offers/active", getActiveOffers);
router.get("/offers/:offerId", getOfferById);

export default router;
