import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || "";
    
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = authorization.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User session is no longer valid" });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};
