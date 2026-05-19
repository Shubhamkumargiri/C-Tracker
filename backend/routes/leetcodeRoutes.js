import express from "express";
import { getLeetcodeAnalytics } from "../controllers/leetcodeController.js";

const router = express.Router();

router.get("/analytics/:username", getLeetcodeAnalytics);

export default router;
