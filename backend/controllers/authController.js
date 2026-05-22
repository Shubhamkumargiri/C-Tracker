import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetOtpEmail } from "../utils/email.js";

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage || "",
  country: user.country || "",
  phone: user.phone || "",
  integrations: user.integrations || { github: false, leetcode: false, devpost: false },
  githubUsername: user.githubUsername || "",
  githubName: user.githubName || "",
  leetcodeUsername: user.leetcodeUsername || "",
  leetcodeName: user.leetcodeName || "",
  devpostUsername: user.devpostUsername || "",
})

const createToken = (userId) =>
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

const isStrongPassword = (password = "") =>
  /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

const PASSWORD_RULES_MESSAGE =
  "Use at least 8 characters with 1 uppercase letter and 1 number. Special characters are optional.";

export const registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_RULES_MESSAGE });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,  
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      token: createToken(user._id),
      user: serializeUser(user)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "If that email exists, an OTP has been sent. Enter it to reset your password.",
      });
    }

    const otp = `${crypto.randomInt(100000, 1000000)}`;
    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpiresAt = new Date(Date.now() + 1000 * 60 * 10);
    user.resetPasswordVerifiedToken = undefined;
    user.resetPasswordVerifiedTokenExpiresAt = undefined;
    
    try {
      await sendPasswordResetOtpEmail(user.email, otp);
      await user.save();
    } catch (error) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiresAt = undefined;
      await user.save();
      throw error;
    }

    res.json({
      message: "If that email exists, an OTP has been sent. Enter it to reset your password.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const hashedOtp = crypto
      .createHash("sha256")
      .update(String(otp || ""))
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "OTP is invalid or has expired" });
    }

    const verifiedToken = crypto.randomBytes(32).toString("hex");
    const hashedVerifiedToken = crypto
      .createHash("sha256")
      .update(verifiedToken)
      .digest("hex");

    user.resetPasswordVerifiedToken = hashedVerifiedToken;
    user.resetPasswordVerifiedTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 10);
    await user.save();

    res.json({
      message: "OTP verified successfully",
      resetToken: verifiedToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: PASSWORD_RULES_MESSAGE });
    }

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(String(resetToken || ""))
      .digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordVerifiedToken: hashedResetToken,
      resetPasswordVerifiedTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset session is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiresAt = undefined;
    user.resetPasswordVerifiedToken = undefined;
    user.resetPasswordVerifiedTokenExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password. Please try again." });
    }

    const token = createToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: serializeUser(user)
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { profileImage = "" } = req.body || {};

    req.user.profileImage = profileImage;
    await req.user.save();

    res.json({
      message: profileImage ? "Profile photo updated" : "Profile photo removed",
      user: serializeUser(req.user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function fetchGithubName(username) {
  try {
    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        "User-Agent": "Career-Tracker-App"
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.name || data.login || "";
    }
  } catch (error) {
    console.error("Failed to fetch public GitHub name:", error);
  }
  return "";
}

async function fetchLeetcodeName(username) {
  try {
    const response = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/${username}/`,
      },
      body: JSON.stringify({
        query: `
          query getLeetcodeName($username: String!) {
            matchedUser(username: $username) {
              profile {
                realName
              }
            }
          }
        `,
        variables: { username },
      }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.data?.matchedUser?.profile?.realName || "";
    }
  } catch (error) {
    console.error("Failed to fetch public LeetCode name:", error);
  }
  return "";
}

export const updateIntegrations = async (req, res) => {
  try {
    const { key, connected = false, username = "" } = req.body || {};

    if (!["github", "leetcode", "devpost"].includes(key)) {
      return res.status(400).json({ message: "Invalid integration platform." });
    }

    if (!req.user.integrations) {
      req.user.integrations = { github: false, leetcode: false, devpost: false };
    }

    req.user.integrations[key] = connected;

    if (key === "github") {
      if (connected) {
        const trimmedUser = String(username || "").trim();
        req.user.githubUsername = trimmedUser;
        req.user.githubName = await fetchGithubName(trimmedUser);
      } else {
        req.user.githubUsername = "";
        req.user.githubName = "";
      }
    } else if (key === "leetcode") {
      if (connected) {
        const trimmedUser = String(username || "").trim();
        req.user.leetcodeUsername = trimmedUser;
        req.user.leetcodeName = await fetchLeetcodeName(trimmedUser);
      } else {
        req.user.leetcodeUsername = "";
        req.user.leetcodeName = "";
      }
    } else if (key === "devpost") {
      if (connected) {
        req.user.devpostUsername = String(username || "").trim();
      } else {
        req.user.devpostUsername = "";
      }
    }

    req.user.markModified("integrations");

    await req.user.save();

    res.json({
      message: `Successfully ${connected ? "connected" : "disconnected"} ${key}`,
      user: serializeUser(req.user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
