import express from "express";
import { getDevpostAnalytics } from "../controllers/devpostController.js";

const router = express.Router();

router.get("/analytics/:username", getDevpostAnalytics);

export default router;
