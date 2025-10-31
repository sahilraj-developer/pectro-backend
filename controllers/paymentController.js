import Payment from "../models/Payment.js";
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
const createPaymentSchema = Joi.object({
  userId: Joi.string().length(24).hex().required(),
  appointmentId: Joi.string().length(24).hex().optional().allow(null),
  orderId: Joi.string().length(24).hex().optional().allow(null),
  type: Joi.string().valid("appointment", "medicine").required(),
  amount: Joi.number().min(0).required(),
  status: Joi.string().valid("pending", "completed", "failed").required(),
});

const updatePaymentSchema = Joi.object({
  status: Joi.string().valid("pending", "completed", "failed").optional(),
  amount: Joi.number().min(0).optional(),
});

// --------------------
// Create Payment
// --------------------
export const createPayment = async (req, res) => {
  try {
    const { error } = createPaymentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const payment = await Payment.create(req.body);
    logAction(req.body.userId, "CREATE_PAYMENT", `Payment created with ID ${payment._id}`);
    res.status(201).json(payment);
  } catch (error) {
    logAction(req.body.userId || null, "CREATE_PAYMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get All Payments
// --------------------
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name email")
      .populate("appointmentId", "scheduleTime")
      .populate("orderId", "totalAmount");
    logAction(null, "FETCH_PAYMENTS", "Fetched all payments");
    res.json(payments);
  } catch (error) {
    logAction(null, "FETCH_PAYMENTS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Payment by ID
// --------------------
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("userId", "name email")
      .populate("appointmentId", "scheduleTime")
      .populate("orderId", "totalAmount");

    if (!payment) return res.status(404).json({ error: "Payment not found" });
    logAction(payment.userId, "FETCH_PAYMENT", `Fetched payment ${payment._id}`);
    res.json(payment);
  } catch (error) {
    logAction(null, "FETCH_PAYMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Update Payment
// --------------------
export const updatePayment = async (req, res) => {
  try {
    const { error } = updatePaymentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    logAction(payment.userId, "UPDATE_PAYMENT", `Updated payment ${payment._id}`);
    res.json(payment);
  } catch (error) {
    logAction(null, "UPDATE_PAYMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Delete Payment
// --------------------
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    logAction(payment.userId, "DELETE_PAYMENT", `Deleted payment ${payment._id}`);
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    logAction(null, "DELETE_PAYMENT_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Payments by User
// --------------------
export const getPaymentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

    logAction(userId, "FETCH_PAYMENTS_BY_USER", `Fetched payments for user ${userId}`);
    res.json(payments);
  } catch (error) {
    logAction(req.params.userId || null, "FETCH_PAYMENTS_BY_USER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Payments by Type
// --------------------
export const getPaymentsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const payments = await Payment.find({ type }).sort({ createdAt: -1 });

    logAction(null, "FETCH_PAYMENTS_BY_TYPE", `Fetched payments of type ${type}`);
    res.json(payments);
  } catch (error) {
    logAction(null, "FETCH_PAYMENTS_BY_TYPE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
