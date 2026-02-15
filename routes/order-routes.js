import { Router } from "express";
import { createOrder, getOrders, getOrderById, updateOrder, deleteOrder } from "../controllers/order-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// Apply auth middleware to all order routes
router.use(authMiddleware);

router.post("/orders/create", createOrder);
router.get("/orders", getOrders);
router.get("/orders/:orderId", getOrderById);
router.put("/orders/:orderId", updateOrder);
router.delete("/orders/:orderId", deleteOrder);

export default router;