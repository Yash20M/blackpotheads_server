import { Router } from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();


router.use(authMiddleware);
router.post("/add", addToWishlist);
router.get("/get", getWishlist);
router.delete("/remove/:productId", removeFromWishlist);

export default router;