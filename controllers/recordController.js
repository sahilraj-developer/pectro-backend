import Record from "../models/Record.js";

// Create record
export const createRecord = async (req, res) => {
  const { title, description, type, value, categoryId, tags, date } = req.body;
  const record = await Record.create({
    userId: req.user._id,
    title,
    description,
    type,
    value,
    categoryId,
    tags,
    date,
  });
  res.status(201).json(record);
};

// Get all records with optional filtering
export const getRecords = async (req, res) => {
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

  res.json({ records, count, page: Number(page), pages: Math.ceil(count / limit) });
};

// Update record
export const updateRecord = async (req, res) => {
  const record = await Record.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Record not found" });
  if (!record.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  Object.assign(record, req.body);
  const updated = await record.save();
  res.json(updated);
};

// Delete record
export const deleteRecord = async (req, res) => {
  const record = await Record.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Record not found" });
  if (!record.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await record.remove();
  res.json({ message: "Record deleted" });
};
