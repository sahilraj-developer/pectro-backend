// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import UserModel from "../models/User.js";

export const checkUserAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN
    if (!token) {
      return res.status(401).json({ status: "failed", message: "Unauthorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decoded.userID).select("-password");

    if (!user) {
      return res.status(401).json({ status: "failed", message: "Unauthorized, user not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    res.status(401).json({ status: "failed", message: "Unauthorized, invalid token", error: error.message });
  }
};
