const express = require("express");
const Product = require("../models/product.js");
const Category = require("../models/category.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

// add new product
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      rating,
      reviews,
    } = req.body;

    //to check if category already exists
    if (category) {
      let newCategory = await Category.findOne({ name: category });
      newCategory = newCategory._id;
      if (!newCategory) {
        newCategory = new Category({ name: category });
        await newCategory.save();
        newCategory = newCategory._id;
      }
    }
    const newCategory = category;

    const newProduct = new Product({
      name,
      description,
      price,
      category: newCategory,
      brand,
      stock,
      images,
      rating,
      reviews,
    });
    await newProduct.save();
    return res
      .status(200)
      .json({ message: "product added successfully", newProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error adding new product", error: err.message });
  }
});

// get all products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const allProducts = await Product.find({});
    if (allProducts.length === 0) {
      return res.status(404).json({ message: "no products yet" });
    }
    return res.status(200).json({ message: "All products: ", allProducts });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error getting all products", error: err.message });
  }
});

//get product by id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    return res
      .status(200)
      .json({ message: `Product with id:${req.params.id}`, product });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error getting product by id", error: err.message });
  }
});

// update product details
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      brand,
      stock,
      images,
      rating,
      reviews,
    } = req.body;

    //to check if category already exists
    let newCategory = await Category.findOne({ name: category });
    newCategory = newCategory._id;
    if (!newCategory) {
      newCategory = new Category({ name: category });
      newCategory = newCategory._id;
    }

    const updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        category: newCategory,
        brand,
        stock,
        images,
        rating,
        reviews,
      },
      { new: true }
    );
    if (!updateProduct) {
      return res.status(404).json({ message: "product not found" });
    }
    await updateProduct.save();
    return res
      .status(200)
      .json({ message: "product details updated", updateProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error updating product details", error: err.message });
  }
});

// delete product
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const deleteProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deleteProduct) {
      return res.status(404).json({ message: "product does not exist" });
    }
    return res.status(200).json({ message: "product deleted!", deleteProduct });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error deleting product", error: err.message });
  }
});

// get products by brandname
router.get("/brand/:brandName", authMiddleware, async (req, res) => {
  try {
    const brandProducts = await Product.find({ brand: req.params.brandName });
    if (brandProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "no products found for this brand" });
    }
    return res.status(200).json({
      message: `products from ${req.params.brandName}: `,
      brandProducts,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error getting products by brand", error: err.message });
  }
});

// update product stock
router.put("/:id/stock", adminMiddleware, async (req, res) => {
  try {
    const updateStock = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: req.body.stock },
      { new: true }
    );
    if (!updateStock) {
      return res.status(404).json({ message: "product does not exist" });
    }
    await updateStock.save();
    return res.status(200).json({ message: "stock updated!", updateStock });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error updating stock", error: err.message });
  }
});

// get products by category
router.get("/category/:categoryId", authMiddleware, async (req, res) => {
  try {
    const filterProducts = await Product.find({
      category: req.params.categoryId,
    });
    if (filterProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "no products found in this category" });
    }
    return res.status(200).json({
      message: `Products of categoryId: ${req.params.categoryId}:`,
      filterProducts,
    });
  } catch (err) {
    return res.status(500).json({
      message: "error getting products by category",
      error: err.message,
    });
  }
});

module.exports = router;
