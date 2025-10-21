import Category from "../models/Category.js";

// Get all categories for user
export const getCategories = async (req, res) => {
  const categories = await Category.find({ userId: req.user._id });
  res.json(categories);
};

// Create category
export const createCategory = async (req, res) => {
  const { name, color, icon } = req.body;

  const exists = await Category.findOne({ userId: req.user._id, name });
  if (exists) return res.status(400).json({ message: "Category already exists" });

  const category = await Category.create({ userId: req.user._id, name, color, icon });
  res.status(201).json(category);
};

// Update category
export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (!category.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  const { name, color, icon } = req.body;
  category.name = name || category.name;
  category.color = color || category.color;
  category.icon = icon || category.icon;

  const updated = await category.save();
  res.json(updated);
};

// Delete category
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });

  if (!category.userId.equals(req.user._id)) return res.status(403).json({ message: "Forbidden" });

  await category.remove();
  res.json({ message: "Category removed" });
};
