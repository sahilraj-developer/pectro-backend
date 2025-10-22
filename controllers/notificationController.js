// controllers/notificationController.js
import Notification from "../models/Notification.js";
import Joi from "joi";
import { logger } from "../config/logger.js";

// --------------------
// Validation Schema
// --------------------
const notificationSchema = Joi.object({
  title: Joi.string().min(2).max(100).required(),
  message: Joi.string().min(2).max(500).required(),
  type: Joi.string().valid("info", "success", "warning", "error").required(),
  link: Joi.string().uri().optional(),
});

// --------------------
// Get All Notifications
// --------------------
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    logger.info(`User ${req.user._id} fetched all notifications`);
    res.json({ status: "success", data: notifications });
  } catch (error) {
    logger.error(`Error fetching notifications for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to fetch notifications", error: error.message });
  }
};

// --------------------
// Create Notification
// --------------------
export const createNotification = async (req, res) => {
  try {
    const { error } = notificationSchema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for user ${req.user._id} on createNotification: ${error.message}`);
      return res.status(400).json({ status: "failed", message: error.message });
    }

    const { title, message, type, link } = req.body;
    const notification = await Notification.create({ userId: req.user._id, title, message, type, link });
    
    logger.info(`User ${req.user._id} created notification: ${title}`);
    res.status(201).json({ status: "success", data: notification });
  } catch (error) {
    logger.error(`Error creating notification for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to create notification", error: error.message });
  }
};

// --------------------
// Mark as Read
// --------------------
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      logger.warn(`Notification not found: ${req.params.id} for user ${req.user._id}`);
      return res.status(404).json({ status: "failed", message: "Notification not found" });
    }

    if (!notification.userId.equals(req.user._id)) {
      logger.warn(`User ${req.user._id} forbidden from marking notification ${req.params.id} as read`);
      return res.status(403).json({ status: "failed", message: "Forbidden" });
    }

    notification.read = true;
    const updated = await notification.save();
    logger.info(`User ${req.user._id} marked notification ${req.params.id} as read`);
    res.json({ status: "success", data: updated });
  } catch (error) {
    logger.error(`Error marking notification ${req.params.id} as read for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to mark as read", error: error.message });
  }
};

// --------------------
// Delete Notification
// --------------------
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      logger.warn(`Notification not found: ${req.params.id} for user ${req.user._id}`);
      return res.status(404).json({ status: "failed", message: "Notification not found" });
    }

    if (!notification.userId.equals(req.user._id)) {
      logger.warn(`User ${req.user._id} forbidden from deleting notification ${req.params.id}`);
      return res.status(403).json({ status: "failed", message: "Forbidden" });
    }

    await notification.remove();
    logger.info(`User ${req.user._id} deleted notification ${req.params.id}`);
    res.json({ status: "success", message: "Notification deleted" });
  } catch (error) {
    logger.error(`Error deleting notification ${req.params.id} for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to delete notification", error: error.message });
  }
};
