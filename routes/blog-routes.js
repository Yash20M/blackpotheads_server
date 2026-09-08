import { Router } from "express";
import {
    getAllBlogs,
    getBlogBySlug,
    adminGetAllBlogs,
    adminGetBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    togglePublish,
} from "../controllers/blog-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";
import { uploadSingle } from "../middlewares/multer.js";

const router = Router();

// ─── PUBLIC routes ────────────────────────────────────────────────────────────
router.get("/v1/blogs", getAllBlogs);
router.get("/v1/blogs/:slug", getBlogBySlug);

// ─── ADMIN routes ─────────────────────────────────────────────────────────────
router.get("/admin/blogs", adminMiddleware, adminGetAllBlogs);
router.get("/admin/blogs/:id", adminMiddleware, adminGetBlogById);
router.post("/admin/blogs", adminMiddleware, uploadSingle, createBlog);
router.put("/admin/blogs/:id", adminMiddleware, uploadSingle, updateBlog);
router.delete("/admin/blogs/:id", adminMiddleware, deleteBlog);
router.patch("/admin/blogs/:id/toggle", adminMiddleware, togglePublish);

export default router;
