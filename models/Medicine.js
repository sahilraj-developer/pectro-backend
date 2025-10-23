import mongoose  from "mongoose";
const medicineSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // role: medicine_store
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    manufacturer: String,
    requiresPrescription: { type: Boolean, default: false },
    image: String,
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
