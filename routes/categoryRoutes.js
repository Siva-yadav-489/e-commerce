const express = require("express");
const Category = require("../models/category.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

// add new category
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    return res
      .status(200)
      .json({ message: "category created successfully", newCategory });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error adding new category", error: err.message });
  }
});

// get all categories
router.get("/", authMiddleware, async (req, res) => {
  try {
    const allCategories = await Category.find({});
    if (allCategories.length === 0) {
      return res.status(500).json({ message: "no categories defined yet" });
    }
    return res.status(200).json({ message: "All categories: ", allCategories });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error getting all categories", error: err.message });
  }
});

// get category by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(500).json({ message: "no such category" });
    }
    return res
      .status(200)
      .json({ message: `Category with id:${req.params.id}`, category });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error getting category by id", error: err.message });
  }
});

// update category
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;
    const updateCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!updateCategory) {
      return res.status(500).json({ message: "no such category" });
    }
    await updateCategory.save();
    return res
      .status(200)
      .json({ message: "Updated successfully!", updateCategory });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error updating category", error: err.message });
  }
});

// delete category
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleteCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deleteCategory) {
      return res.status(500).json({ message: "no such category" });
    }
    return res
      .status(200)
      .json({ message: "deleted successfully!", deleteCategory });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error deleting category", error: err.message });
  }
});

module.exports = router;
