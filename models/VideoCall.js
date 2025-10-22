const videoCallSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    startTime: Date,
    endTime: Date,
    duration: Number,
    roomId: String,
    status: { type: String, enum: ["active", "ended"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("VideoCall", videoCallSchema);
