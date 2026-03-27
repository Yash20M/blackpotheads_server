import { Router } from "express";
import {
    getFeaturedVideo
} from "../controllers/video-controller.js";

const router = Router();

// Public route - no authentication required
router.get("/featured", getFeaturedVideo);

export default router;