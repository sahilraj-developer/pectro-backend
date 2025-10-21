// routes/userRoutes.js
import express from "express";
const router = express.Router();

import {
  userRegistration,
  userLogin,
  changeUserPassword,
  loggedUser,
  sendUserPasswordResetMail,
  userPasswordReset,
} from "../controllers/userController.js";

import { checkUserAuth } from "../middleware/authMiddleware.js";

// ------------------------
// Public Routes
// ------------------------
router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/send-reset-password-email", sendUserPasswordResetMail);
router.post("/reset-password/:id/:token", userPasswordReset);

// ------------------------
// Private Routes (Protected)
// ------------------------
// Protect middleware applies only to routes below
router.use(checkUserAuth);

router.post("/changepassword", changeUserPassword);
router.get("/changepassword", loggedUser);

export default router;
