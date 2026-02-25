import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth-routes.js";
import userRoutes from "./routes/user-routes.js";
import productRoutes from "./routes/product-routes.js";
import adminRoutes from "./routes/admin-routes.js";
import { connectDB } from "./utils/config.js";
import cors from "cors";
import wishlistRoutes from "./routes/wishlist-routes.js";
import errorMiddleware from "./middlewares/error-middleware.js";
import orderRoutes from "./routes/order-routes.js";
import cartRoutes from "./routes/cart-routes.js";
import webhookRoutes from "./routes/webhook-routes.js";
import offerRoutes from "./routes/offer-routes.js";
import reviewRoutes from "./routes/review-routes.js";
import { startScheduledJobs } from "./utils/scheduledJobs.js";
dotenv.config();



const app = express();
connectDB();




// app.options("*", cors());
const corsOptions = {
    origin: function (origin, callback) {
      

        const allowedOrigins = [
            process.env.FRONTEND_URL,
            "https://api.blackpotheads.com",
            "http://localhost:5173",

        ].filter(Boolean);


        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Check for exact match first
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        // Check for Netlify patterns (*.netlify.app)
        if (origin.endsWith('.netlify.app')) {
            callback(null, true);
            return;
        }

      
        // In development or if FRONTEND_URL is not set, be more permissive
        if (process.env.NODE_ENV === 'development' || !process.env.FRONTEND_URL) {
            console.log("Development mode or FRONTEND_URL not set - allowing anyway");
            callback(null, true);
        } else {
            callback(new Error(`CORS: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

const PORT = process.env.PORT || 3000;

// Webhook route MUST come before express.json() middleware
app.use("/api/webhook", webhookRoutes);

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use("/api/v1", authRoutes)
app.use("/api/v1", userRoutes)
app.use("/api/v1", productRoutes)
app.use("/api/v1/wishlist", wishlistRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/v1", orderRoutes)
app.use("/api/v1", offerRoutes)
app.use("/api/v1/reviews", reviewRoutes)


app.use(errorMiddleware);

// Start scheduled jobs
startScheduledJobs();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});