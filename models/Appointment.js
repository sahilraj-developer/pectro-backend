import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scheduleTime: { type: Date, required: true },
    mode: { type: String, enum: ["video", "in_person"], default: "video" },
    status: { 
      type: String, 
      enum: ["scheduled", "ongoing", "completed", "cancelled"], 
      default: "scheduled" 
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    videoRoomId: { type: String }, // for Twilio or WebRTC
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
