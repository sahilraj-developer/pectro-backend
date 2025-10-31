import Order from "../models/Order.js";
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
const createOrderSchema = Joi.object({
  userId: Joi.string().length(24).hex().required(),
  storeId: Joi.string().length(24).hex().required(),
  items: Joi.array().items(
    Joi.object({
      medicineId: Joi.string().length(24).hex().required(),
      quantity: Joi.number().min(1).required(),
    })
  ).min(1).required(),
  totalAmount: Joi.number().min(0).required(),
  paymentId: Joi.string().required(),
  deliveryAddress: Joi.string().required(),
});

const updateOrderSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "shipped", "delivered", "cancelled"),
  deliveryAddress: Joi.string(),
  paymentId: Joi.string(),
});

// --------------------
// Create Order
// --------------------
export const createOrder = async (req, res) => {
  try {
    const { error } = createOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const order = await Order.create(req.body);
    logAction(req.body.userId, "CREATE_ORDER", `Order created with ID ${order._id}`);
    res.status(201).json(order);
  } catch (error) {
    logAction(req.body.userId || null, "CREATE_ORDER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get All Orders
// --------------------
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("storeId", "name email")
      .populate("items.medicineId", "name price");
    logAction(null, "FETCH_ORDERS", "Fetched all orders");
    res.json(orders);
  } catch (error) {
    logAction(null, "FETCH_ORDERS_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Order by ID
// --------------------
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("storeId", "name email")
      .populate("items.medicineId", "name price");
    if (!order) return res.status(404).json({ error: "Order not found" });

    logAction(order.userId, "FETCH_ORDER", `Fetched order ${order._id}`);
    res.json(order);
  } catch (error) {
    logAction(null, "FETCH_ORDER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Update Order
// --------------------
export const updateOrder = async (req, res) => {
  try {
    const { error } = updateOrderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });

    logAction(order.userId, "UPDATE_ORDER", `Updated order ${order._id}`);
    res.json(order);
  } catch (error) {
    logAction(null, "UPDATE_ORDER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Delete Order
// --------------------
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    logAction(order.userId, "DELETE_ORDER", `Deleted order ${order._id}`);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    logAction(null, "DELETE_ORDER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Orders by User
// --------------------
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("items.medicineId", "name price")
      .populate("storeId", "name email")
      .sort({ createdAt: -1 });

    logAction(userId, "FETCH_ORDERS_BY_USER", `Fetched orders for user ${userId}`);
    res.json(orders);
  } catch (error) {
    logAction(req.params.userId || null, "FETCH_ORDERS_BY_USER_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Orders by Store
// --------------------
export const getOrdersByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await Order.find({ storeId })
      .populate("items.medicineId", "name price")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    logAction(storeId, "FETCH_ORDERS_BY_STORE", `Fetched orders for store ${storeId}`);
    res.json(orders);
  } catch (error) {
    logAction(req.params.storeId || null, "FETCH_ORDERS_BY_STORE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
