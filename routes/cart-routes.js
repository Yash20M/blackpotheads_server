import { Router } from "express";
import { addToCart, clearCart, getCart, removeFromCart, updateCart } from "../controllers/cart-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

router.use(authMiddleware);
router.post("/add", addToCart);
router.delete("/remove/:productId", removeFromCart);
router.get("/get-cart", getCart);
router.delete("/clear-cart", clearCart);
router.put("/update", updateCart);


export default router;