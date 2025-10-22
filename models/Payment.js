const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, enum: ["card", "upi", "wallet"], required: true },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed"], 
      default: "pending" 
    },
    referenceId: { type: String }, // Razorpay or Stripe ID
    type: { type: String, enum: ["appointment", "medicine"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
