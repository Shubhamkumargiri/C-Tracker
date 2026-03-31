import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateProfileImage,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.patch("/profile-image", protect, updateProfileImage);

export default router;
