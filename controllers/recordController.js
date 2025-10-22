import Record from "../models/Record.js";
import Joi from "joi";

// --------------------
// Validation Schemas
// --------------------
const recordSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  type: Joi.string().valid("income", "expense").required(),
  value: Joi.number().required(),
  categoryId: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  date: Joi.date().required(),
});

// --------------------
// Create Record
// --------------------
export const createRecord = async (req, res) => {
  try {
    const { error } = recordSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const record = await Record.create({ userId: req.user._id, ...req.body });
    console.log(`Record created by ${req.user._id}: ${record._id}`);
    res.status(201).json(record);
  } catch (err) {
    console.error("Create record error:", err.message);
    res.status(500).json({ message: "Unable to create record" });
  }
};

// --------------------
// Get Records with Filter & Pagination
// --------------------
export const getRecords = async (req, res) => {
  try {
    const { categoryId, type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };

    if (categoryId) filter.categoryId = categoryId;
    if (type) filter.type = type;
    if (startDate || endDate) filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);

    const records = await Record.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const count = await Record.countDocuments(filter);
    console.log(`Records fetched by ${req.user._id}: ${records.length}`);

    res.json({ records, count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (err) {
    console.error("Get records error:", err.message);
    res.status(500).json({ message: "Unable to fetch records" });
  }
};

// --------------------
// Update Record
// --------------------
export const updateRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (!record.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    const { error } = recordSchema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ message: error.details[0].message });

    Object.assign(record, req.body);
    const updated = await record.save();
    console.log(`Record updated by ${req.user._id}: ${record._id}`);

    res.json(updated);
  } catch (err) {
    console.error("Update record error:", err.message);
    res.status(500).json({ message: "Unable to update record" });
  }
};

// --------------------
// Delete Record
// --------------------
export const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    if (!record.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

    await record.remove();
    console.log(`Record deleted by ${req.user._id}: ${record._id}`);
    res.json({ message: "Record deleted" });
  } catch (err) {
    console.error("Delete record error:", err.message);
    res.status(500).json({ message: "Unable to delete record" });
  }
};
