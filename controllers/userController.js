// controllers/userController.js
import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../config/emailConfig.js";

// --------------------
// User Registration
// --------------------
export const userRegistration = async (req, res) => {
  const { name, email, password, password_confirmation, tc } = req.body;

  if (!name || !email || !password || !password_confirmation || !tc) {
    return res.status(400).json({ status: "failed", message: "All fields are required" });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ status: "failed", message: "Passwords do not match" });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "failed", message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({ name, email, password: hashPassword, tc });
    await newUser.save();

    const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });

    res.status(201).json({ status: "success", message: "Register success", token });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to register", error: error.message });
  }
};

// --------------------
// User Login
// --------------------
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ status: "failed", message: "All fields are required" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ status: "failed", message: "Not a registered user" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ status: "failed", message: "Email or password does not match" });

    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" });
    res.status(200).json({ status: "success", message: "Login success", token });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to login", error: error.message });
  }
};

// --------------------
// Change Password
// --------------------
export const changeUserPassword = async (req, res) => {
  const { password, password_confirmation } = req.body;

  if (!password || !password_confirmation) {
    return res.status(400).json({ status: "failed", message: "All fields are required" });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ status: "failed", message: "Passwords do not match" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: hashPassword } });
    res.status(200).json({ status: "success", message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to change password", error: error.message });
  }
};

// --------------------
// Logged User Info
// --------------------
export const loggedUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

// --------------------
// Send Password Reset Email
// --------------------
export const sendUserPasswordResetMail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: "failed", message: "Email is required" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ status: "failed", message: "User does not exist" });

    const secret = user._id + process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: "15m" });
    const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset Password Link",
      html: `<a href="${link}">Click here</a> to reset your password`,
    });

    res.status(200).json({ status: "success", message: "Reset password email sent", info });
  } catch (error) {
    res.status(500).json({ status: "failed", message: "Unable to send reset email", error: error.message });
  }
};

// --------------------
// Reset Password
// --------------------
export const userPasswordReset = async (req, res) => {
  const { password, password_confirmation } = req.body;
  const { id, token } = req.params;

  if (!password || !password_confirmation) {
    return res.status(400).json({ status: "failed", message: "All fields are required" });
  }

  if (password !== password_confirmation) {
    return res.status(400).json({ status: "failed", message: "Passwords do not match" });
  }

  try {
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ status: "failed", message: "User not found" });

    const secret = user._id + process.env.JWT_SECRET_KEY;
    jwt.verify(token, secret);

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await UserModel.findByIdAndUpdate(id, { $set: { password: hashPassword } });
    res.status(200).json({ status: "success", message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ status: "failed", message: "Invalid or expired token", error: error.message });
  }
};
