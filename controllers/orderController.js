import Order from "../models/Order.js";

/**
 * ✅ Create new order
 */
export const createOrder = async (req, res) => {
  try {
    const { userId, storeId, items, totalAmount, paymentId, deliveryAddress } = req.body;

    const order = new Order({
      userId,
      storeId,
      items,
      totalAmount,
      paymentId,
      deliveryAddress,
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("storeId", "name email")
      .populate("items.medicineId", "name price");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("storeId", "name email")
      .populate("items.medicineId", "name price");
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update order (status / address)
 */
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Delete order
 */
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get all orders for a user
 */
export const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId })
      .populate("items.medicineId", "name price")
      .populate("storeId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get all orders for a store
 */
export const getOrdersByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await Order.find({ storeId })
      .populate("items.medicineId", "name price")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
