import Medicine from "../models/Medicine.js";
import Joi from "joi";

// --------------------
// Logger
// --------------------
const logAction = (userId, action, message) => {
  console.log(`[${new Date().toISOString()}] User: ${userId || "N/A"} | Action: ${action} | ${message}`);
};

// --------------------
// Validation Schemas
// --------------------
const createMedicineSchema = Joi.object({
  storeId: Joi.string().length(24).hex().required(),
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow("").max(500),
  category: Joi.string().allow("").max(100),
  price: Joi.number().min(0).required(),
  stock: Joi.number().min(0).default(0),
  manufacturer: Joi.string().allow("").max(100),
  requiresPrescription: Joi.boolean().default(false),
  image: Joi.string().uri().allow("", null),
});

const updateMedicineSchema = Joi.object({
  storeId: Joi.string().length(24).hex(),
  name: Joi.string().min(2).max(100),
  description: Joi.string().allow("").max(500),
  category: Joi.string().allow("").max(100),
  price: Joi.number().min(0),
  stock: Joi.number().min(0),
  manufacturer: Joi.string().allow("").max(100),
  requiresPrescription: Joi.boolean(),
  image: Joi.string().uri().allow("", null),
});

// --------------------
// Create Medicine
// --------------------
export const createMedicine = async (req, res) => {
  try {
    const { error } = createMedicineSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const medicine = await Medicine.create(req.body);
    logAction(req.body.storeId, "CREATE_MEDICINE", `Medicine created with ID ${medicine._id}`);
    res.status(201).json(medicine);
  } catch (error) {
    logAction(req.body.storeId || null, "CREATE_MEDICINE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get All Medicines
// --------------------
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().populate("storeId", "name email");
    logAction(null, "FETCH_MEDICINES", "Fetched all medicines");
    res.json(medicines);
  } catch (error) {
    logAction(null, "FETCH_MEDICINES_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Medicine by ID
// --------------------
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate("storeId", "name email");
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    logAction(medicine.storeId, "FETCH_MEDICINE", `Fetched medicine ${medicine._id}`);
    res.json(medicine);
  } catch (error) {
    logAction(null, "FETCH_MEDICINE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Update Medicine
// --------------------
export const updateMedicine = async (req, res) => {
  try {
    const { error } = updateMedicineSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    logAction(req.body.storeId || null, "UPDATE_MEDICINE", `Updated medicine ${medicine._id}`);
    res.json(medicine);
  } catch (error) {
    logAction(req.body.storeId || null, "UPDATE_MEDICINE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Delete Medicine
// --------------------
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    logAction(medicine.storeId, "DELETE_MEDICINE", `Deleted medicine ${medicine._id}`);
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    logAction(null, "DELETE_MEDICINE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};

// --------------------
// Get Medicines by Store
// --------------------
export const getMedicinesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const medicines = await Medicine.find({ storeId }).sort({ name: 1 });

    logAction(storeId, "FETCH_MEDICINES_BY_STORE", `Fetched medicines for store ${storeId}`);
    res.json(medicines);
  } catch (error) {
    logAction(req.params.storeId || null, "FETCH_MEDICINES_BY_STORE_ERROR", error.message);
    res.status(500).json({ error: error.message });
  }
};
