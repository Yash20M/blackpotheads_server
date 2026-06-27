import { Router } from "express";
import { 
    submitCollabForm,
    getAllCollabs,
    getCollabById,
    updateCollabStatus,
    deleteCollab
} from "../controllers/collab-controller.js";
import { adminMiddleware } from "../middlewares/auth-middleware.js";

const router = Router();

// Public route - Submit collab form
router.post("/v1/collabs/submit", submitCollabForm);

// Admin routes - Require admin authentication
router.get("/admin/collabs", adminMiddleware, getAllCollabs);
router.get("/admin/collabs/:id", adminMiddleware, getCollabById);
router.put("/admin/collabs/:id/status", adminMiddleware, updateCollabStatus);
router.delete("/admin/collabs/:id", adminMiddleware, deleteCollab);

export default router;
