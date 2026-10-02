import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import leetcodeRoutes from "./routes/leetcodeRoutes.js";
import timelineRoutes from "./routes/timelineRoutes.js";
import devpostRoutes from "./routes/devpostRoutes.js";
import ctaiRoutes from "./routes/ctaiRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : null,
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !process.env.FRONTEND_URL) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/devpost", devpostRoutes);
app.use("/api/ctai", ctaiRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/api/routes-check", (req, res) => {
  res.json({
    ok: true,
    routes: [
      "/api/auth",
      "/api/github/analytics/:username",
      "/api/leetcode/analytics/:username",
      "/api/timeline",
      "/api/timeline/snapshot",
    ],
  });
});

app.get("/", (req, res) => {
  res.send("Tracker API Running...");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
