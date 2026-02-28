import { Router } from "express";
import {
  getActiveOffers,
  getOfferById
} from "../controllers/offer-controller.js";

const router = Router();

router.get("/offers/active", (req, res, next) => {
  next();
}, getActiveOffers);

router.get("/offers/:offerId", getOfferById);


export default router;
