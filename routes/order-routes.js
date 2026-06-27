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
    debugGetOrderWithPayment,
    // Guest order functions
    createGuestOrder,
    trackGuestOrder,
    trackGuestOrdersByContact,
    getGuestOrderById,
    // Guest payment functions
    createGuestRazorpayOrder,
    verifyGuestPayment
} from "../controllers/order-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// Guest order routes (NO authentication required)
router.post("/orders/guest/create", createGuestOrder); // COD only
router.post("/orders/guest/create-razorpay-order", createGuestRazorpayOrder); // Online payment
router.post("/orders/guest/verify-payment", verifyGuestPayment); // Verify online payment
router.post("/orders/guest/track", trackGuestOrder); // Track with order ID
router.post("/orders/guest/track-by-contact", trackGuestOrdersByContact); // Track without order ID (NEW)
router.get("/orders/guest/:orderId", getGuestOrderById);

// Apply auth middleware to authenticated order routes
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
