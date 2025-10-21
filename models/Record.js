import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ["activity", "income", "expense", "goal"], default: "activity" },
    value: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "completed"], default: "completed" },
    date: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    attachments: { type: [String], default: [] },
    location: { city: String, country: String },
  },
  { timestamps: true }
);

recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ categoryId: 1 });

export default mongoose.model("Record", recordSchema);
