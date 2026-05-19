import express from "express";
import { getGithubAnalytics } from "../controllers/githubController.js";

const router = express.Router();

router.get("/analytics/:username", getGithubAnalytics);

export default router;
