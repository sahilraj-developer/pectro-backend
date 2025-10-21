import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notificationsEnabled: { type: Boolean, default: true },
    autoBackup: { type: Boolean, default: false },
    timezone: { type: String, default: "Asia/Kolkata" },
    preferredCurrency: { type: String, default: "INR" },
    defaultView: { type: String, enum: ["day", "week", "month"], default: "month" },
    theme: { type: String, enum: ["light", "dark"], default: "light" },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
