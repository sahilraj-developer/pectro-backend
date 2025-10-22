const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], 
      default: "pending" 
    },
    deliveryAddress: {
      line1: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
