import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    getOrdersByUser,
    getOrdersByStatus,
    getOrdersByDate,
    getOrdersByAmount,
    getOrdersByPaymentMethod,
    getOrdersByAddress,
    getOrdersByUserId,
    getOrdersByProductId,
    getOrdersByProductName
} from "../controllers/order-controller.js";

import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// ✅ All routes below require authentication
router.use(authMiddleware);

// 📦 Basic CRUD
router.post("/create", createOrder);        
router.get("/", getOrders);                 
router.get("/:orderId", getOrderById);        
router.put("/:orderId", updateOrder);         
router.delete("/:orderId", deleteOrder);      

// 🔍 Filter routes
router.get("/filter/user", getOrdersByUser);                              
router.get("/filter/status/:status", getOrdersByStatus);                  
router.get("/filter/date/:date", getOrdersByDate);                        
router.get("/filter/amount/:amount", getOrdersByAmount);                  
router.get("/filter/payment-method/:paymentMethod", getOrdersByPaymentMethod);
router.get("/filter/address/:address", getOrdersByAddress);              
router.get("/filter/user-id/:userId", getOrdersByUserId);                
router.get("/filter/product-id/:productId", getOrdersByProductId);       
router.get("/filter/product-name/:productName", getOrdersByProductName); 

export default router;
