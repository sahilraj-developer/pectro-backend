import Setting from "../models/Setting.js";

// Get settings for logged-in user
export const getSettings = async (req, res) => {
  let settings = await Setting.findOne({ userId: req.user._id });
  if (!settings) {
    // Create default settings if none exist
    settings = await Setting.create({ userId: req.user._id });
  }
  res.json(settings);
};

// Update user settings
export const updateSettings = async (req, res) => {
  let settings = await Setting.findOne({ userId: req.user._id });
  if (!settings) return res.status(404).json({ message: "Settings not found" });

  Object.assign(settings, req.body); // Update with new settings
  const updated = await settings.save();
  res.json(updated);
};
