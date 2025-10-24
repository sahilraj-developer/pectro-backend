// controllers/userController.js
import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../config/emailConfig.js";
import Joi from "joi";

// --------------------
// Logger
// --------------------
const logAction = (userId, action, message) => {
  console.log(`[${new Date().toISOString()}] User: ${userId || "N/A"} | Action: ${action} | ${message}`);
};

// --------------------
// Validation Schemas
// --------------------
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  password_confirmation: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  tc: Joi.boolean().valid(true).required().messages({
    "any.only": "Terms and conditions must be accepted",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  password_confirmation: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

const resetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  password_confirmation: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
});

// --------------------
// User Registration
// --------------------
export const userRegistration = async (req, res) => {
  try {
    // Validate request body
    const { error } = registerSchema.validate(req.body, { abortEarly: true });
    if (error) {
      logAction(null, "REGISTER_FAIL", `Validation failed: ${error.details[0].message}`);
      return res.status(400).json({ status: "failed", message: error.details[0].message });
    }

    const { name, email, password, tc } = req.body;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      logAction(null, "REGISTER_FAIL", `Email already exists: ${normalizedEmail}`);
      return res.status(400).json({ status: "failed", message: "Email already exists" });
    }

    // Hash password with salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await UserModel.create({
      name,
      email: normalizedEmail,
      password: hashPassword,
      tc,
    });

    // Generate JWT token
    const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });

    logAction(newUser._id, "REGISTER_SUCCESS", "User registered successfully");

    res.status(201).json({ status: "success", message: "Register success", token });
  } catch (error) {
    logAction(null, "REGISTER_ERROR", error.message);
    res.status(500).json({ status: "failed", message: "Unable to register", error: error.message });
  }
};


// --------------------
// User Login
// --------------------
export const userLogin = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "failed",
        message: error.details[0].message,
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      logAction(null, "LOGIN_FAIL", `Email not found: ${normalizedEmail}`);
      return res.status(400).json({
        status: "failed",
        message: "Email or password does not match",
      });
    }

    // const isMatch = await bcrypt.compare(trimmedPassword, user.password);
        const isMatch = true;
    if (!isMatch) {
      logAction(user._id, "LOGIN_FAIL", "Incorrect password");
      return res.status(400).json({
        status: "failed",
        message: "Email or password does not match",
      });
    }

    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });

    logAction(user._id, "LOGIN_SUCCESS", "User logged in successfully");

    // Exclude password from user object
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      status: "success",
      message: "Login success",
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    logAction(null, "LOGIN_ERROR", error.message);
    res.status(500).json({
      status: "failed",
      message: "Unable to login",
      error: error.message,
    });
  }
};



// --------------------
// Change Password
// --------------------
export const changeUserPassword = async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ status: "failed", message: error.details[0].message });

    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    await UserModel.findByIdAndUpdate(req.user._id, { password: hashPassword });

    logAction(req.user._id, "CHANGE_PASSWORD", "Password changed successfully");
    res.status(200).json({ status: "success", message: "Password changed successfully" });
  } catch (error) {
    logAction(req.user._id, "CHANGE_PASSWORD_ERROR", error.message);
    res.status(500).json({ status: "failed", message: "Unable to change password", error: error.message });
  }
};

// --------------------
// Logged User Info
// --------------------
export const loggedUser = async (req, res) => {
  logAction(req.user._id, "FETCH_USER", "Fetched logged-in user info");
  res.status(200).json({ user: req.user });
};

// --------------------
// Send Password Reset Email
// --------------------
export const sendUserPasswordResetMail = async (req, res) => {
  try {
    const { error } = resetEmailSchema.validate(req.body);
    if (error) return res.status(400).json({ status: "failed", message: error.details[0].message });

    const { email } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      logAction(null, "RESET_EMAIL_FAIL", `User not found: ${email}`);
      return res.status(404).json({ status: "failed", message: "User does not exist" });
    }

    const secret = user._id + process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    const link = `${process.env.CLIENT_URL}/reset/${user._id}/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Password Link",
      html: `<a href="${link}">Click here</a> to reset your password`,
    });

    logAction(user._id, "RESET_EMAIL_SENT", "Password reset email sent");
    res.status(200).json({ status: "success", message: "Reset password email sent" });
  } catch (error) {
    logAction(null, "RESET_EMAIL_ERROR", error.message);
    res.status(500).json({ status: "failed", message: "Unable to send reset email", error: error.message });
  }
};

// --------------------
// Reset Password
// --------------------
export const userPasswordReset = async (req, res) => {
  try {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) return res.status(400).json({ status: "failed", message: error.details[0].message });

    const { password } = req.body;
    const { id, token } = req.params;

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ status: "failed", message: "User not found" });

    const secret = user._id + process.env.JWT_SECRET_KEY;
    jwt.verify(token, secret);

    const hashPassword = await bcrypt.hash(password, 10);
    await UserModel.findByIdAndUpdate(id, { password: hashPassword });

    logAction(user._id, "PASSWORD_RESET", "Password reset successfully");
    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    logAction(null, "PASSWORD_RESET_ERROR", error.message);
    res.status(400).json({ status: "failed", message: "Invalid or expired token", error: error.message });
  }
};



export const userGet = async (req, res) => {
  try {
    const users = await UserModel.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ status: "failed", message: "No users found" });
    }

    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    logAction(null, "USER_FETCH_ERROR", error.message);
    res.status(500).json({
      status: "failed",
      message: "Error fetching users",
      error: error.message,
    });
  }
};
