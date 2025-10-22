// controllers/categoryController.js
import Category from "../models/Category.js";
import Joi from "joi";
import { logger } from "../config/logger.js";

// --------------------
// Validation Schemas
// --------------------
const categorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  color: Joi.string().optional(),
  icon: Joi.string().optional(),
});

// --------------------
// Get All Categories
// --------------------
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id });
    logger.info(`User ${req.user._id} fetched all categories`);
    res.json({ status: "success", data: categories });
  } catch (error) {
    logger.error(`Error fetching categories for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to fetch categories", error: error.message });
  }
};

// --------------------
// Create Category
// --------------------
export const createCategory = async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      logger.warn(`Validation failed for user ${req.user._id} on createCategory: ${error.message}`);
      return res.status(400).json({ status: "failed", message: error.message });
    }

    const { name, color, icon } = req.body;

    const exists = await Category.findOne({ userId: req.user._id, name });
    if (exists) {
      logger.warn(`User ${req.user._id} attempted to create duplicate category: ${name}`);
      return res.status(400).json({ status: "failed", message: "Category already exists" });
    }

    const category = await Category.create({ userId: req.user._id, name, color, icon });
    logger.info(`User ${req.user._id} created category: ${name}`);
    res.status(201).json({ status: "success", data: category });
  } catch (error) {
    logger.error(`Error creating category for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to create category", error: error.message });
  }
};

// --------------------
// Update Category
// --------------------
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      logger.warn(`Category not found: ${req.params.id} for user ${req.user._id}`);
      return res.status(404).json({ status: "failed", message: "Category not found" });
    }

    if (!category.userId.equals(req.user._id)) {
      logger.warn(`User ${req.user._id} forbidden from updating category ${req.params.id}`);
      return res.status(403).json({ status: "failed", message: "Forbidden" });
    }

    const { error } = categorySchema.validate(req.body, { allowUnknown: true });
    if (error) {
      logger.warn(`Validation failed for user ${req.user._id} on updateCategory: ${error.message}`);
      return res.status(400).json({ status: "failed", message: error.message });
    }

    const { name, color, icon } = req.body;
    category.name = name || category.name;
    category.color = color || category.color;
    category.icon = icon || category.icon;

    const updated = await category.save();
    logger.info(`User ${req.user._id} updated category ${req.params.id}`);
    res.json({ status: "success", data: updated });
  } catch (error) {
    logger.error(`Error updating category ${req.params.id} for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to update category", error: error.message });
  }
};

// --------------------
// Delete Category
// --------------------
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      logger.warn(`Category not found: ${req.params.id} for user ${req.user._id}`);
      return res.status(404).json({ status: "failed", message: "Category not found" });
    }

    if (!category.userId.equals(req.user._id)) {
      logger.warn(`User ${req.user._id} forbidden from deleting category ${req.params.id}`);
      return res.status(403).json({ status: "failed", message: "Forbidden" });
    }

    await category.remove();
    logger.info(`User ${req.user._id} deleted category ${req.params.id}`);
    res.json({ status: "success", message: "Category removed" });
  } catch (error) {
    logger.error(`Error deleting category ${req.params.id} for user ${req.user._id}: ${error.message}`);
    res.status(500).json({ status: "failed", message: "Unable to delete category", error: error.message });
  }
};
