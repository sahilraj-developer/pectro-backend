import Notification from "../models/Notification.js";

// Get all notifications for logged-in user
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 });
  res.json(notifications);
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { title, message, type, link } = req.body;
  const notification = await Notification.create({
    userId: req.user._id,
    title,
    message,
    type,
    link,
  });
  res.status(201).json(notification);
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });

  if (!notification.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  notification.read = true;
  const updated = await notification.save();
  res.json(updated);
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });

  if (!notification.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await notification.remove();
  res.json({ message: "Notification deleted" });
};
