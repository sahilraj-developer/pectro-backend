import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:{ type:String, required:true, trim:true},
    specialization: { type: String, required: true },
    qualification: { type: String },
    experienceYears: { type: Number },
    bio: { type: String },
    consultationFee: { type: Number, default: 0 },
    availableSlots: [
      {
        day: { type: String, enum: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
        startTime: String,
        endTime: String,
      },
    ],
    rating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
