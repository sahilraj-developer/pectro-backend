import Medicine from "../models/Medicine.js";

/**
 * ✅ Create new medicine
 */
export const createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Get all medicines
 */
export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().populate("storeId", "name email");
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get medicine by ID
 */
export const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate("storeId", "name email");
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Update medicine
 */
export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * ✅ Delete medicine
 */
export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });
    res.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ✅ Get medicines by store
 */
export const getMedicinesByStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const medicines = await Medicine.find({ storeId }).sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
