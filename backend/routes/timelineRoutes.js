import express from "express";
import { getTimeline, saveDailySnapshot } from "../controllers/timelineController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getTimeline);
router.post("/snapshot", protect, saveDailySnapshot);

export default router;
