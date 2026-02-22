import { Router } from "express";
import { 
    createOrder, 
    createRazorpayOrder, 
    verifyPayment, 
    getOrders, 
    getOrderById, 
    updateOrder, 
    deleteOrder,
    getPaymentDetails,
    getUserPayments,
    cancelPendingOrder,
    debugGetAllPayments,
    debugGetOrderWithPayment
} from "../controllers/order-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// Apply auth middleware to all order routes
router.use(authMiddleware);

// Payment routes
router.post("/orders/create-razorpay-order", createRazorpayOrder);
router.post("/orders/verify-payment", verifyPayment);

// COD order route
router.post("/orders/create", createOrder);

// Order management routes - specific routes BEFORE parameterized routes
router.post("/orders/:orderId/cancel", cancelPendingOrder);
router.patch("/orders/:orderId/cancel", cancelPendingOrder);
router.get("/orders/:orderId/payment", getPaymentDetails);
router.get("/orders", getOrders);
router.get("/orders/:orderId", getOrderById);
router.put("/orders/:orderId", updateOrder);
router.delete("/orders/:orderId", deleteOrder);

// User payment routes
router.get("/payments", getUserPayments);

// Debug routes (remove in production)
router.get("/debug/payments", debugGetAllPayments);
router.get("/debug/order/:orderId", debugGetOrderWithPayment);

export default router;
