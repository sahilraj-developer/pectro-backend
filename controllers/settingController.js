import Setting from "../models/Setting.js";
import Joi from "joi";

// --------------------
// Validation Schema
// --------------------
const updateSettingsSchema = Joi.object({
  notificationsEnabled: Joi.boolean(),
  autoBackup: Joi.boolean(),
  timezone: Joi.string().min(3).max(50),
  preferredCurrency: Joi.string().min(1).max(10),
  defaultView: Joi.string().valid("day", "week", "month"),
  theme: Joi.string().valid("light", "dark"),
}).min(1);

// --------------------
// Logger function (replace with winston/pino in production)
// --------------------
const logAction = (userId, action, message) => {
  console.log(`[${new Date().toISOString()}] User: ${userId} | Action: ${action} | ${message}`);
};

// --------------------
// Get Settings
// --------------------
export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Setting.create({ userId: req.user._id });
      logAction(req.user._id, "GET_SETTINGS", "Default settings created");
    } else {
      logAction(req.user._id, "GET_SETTINGS", "Fetched settings");
    }
    res.json(settings);
  } catch (err) {
    logAction(req.user._id, "GET_SETTINGS_ERROR", err.message);
    res.status(500).json({ message: "Unable to fetch settings" });
  }
};

// --------------------
// Update Settings
// --------------------
export const updateSettings = async (req, res) => {
  try {
    const { error } = updateSettingsSchema.validate(req.body);
    if (error) {
      logAction(req.user._id, "UPDATE_SETTINGS_FAIL", `Validation error: ${error.details[0].message}`);
      return res.status(400).json({ message: error.details[0].message });
    }

    let settings = await Setting.findOne({ userId: req.user._id });
    if (!settings) {
      logAction(req.user._id, "UPDATE_SETTINGS_FAIL", "Settings not found");
      return res.status(404).json({ message: "Settings not found" });
    }

    Object.assign(settings, req.body);
    const updated = await settings.save();
    logAction(req.user._id, "UPDATE_SETTINGS_SUCCESS", "Settings updated successfully");

    res.json(updated);
  } catch (err) {
    logAction(req.user._id, "UPDATE_SETTINGS_ERROR", err.message);
    res.status(500).json({ message: "Unable to update settings" });
  }
};
