const express = require("express");
const Product = require("../models/product.js");
const Order = require("../models/order.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const router = express.Router();

// search products by keyword
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Please enter a search query" });
    }
    // removes all white spaces
    const sanitizedQuery = query.trim().replace(/\s+/g, "");
    const productResults = await Product.find({
      $or: [
        {
          name: {
            // checks every combo with and without space
            $regex: sanitizedQuery.split("").join("\\s*"),
            $options: "i",
          },
        },
        {
          // checks every combo with and without space in description also
          description: {
            $regex: sanitizedQuery.split("").join("\\s*"),
            $options: "i",
          },
        },
      ],
    });

    if (productResults.length === 0) {
      return res.status(404).json({ message: "no products found" });
    }
    return res
      .status(200)
      .json({ message: `search results for ${query}`, productResults });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error searching products", error: err.message });
  }
});

// sort products
router.get("/products/sort/:type", authMiddleware, async (req, res) => {
  try {
    const sortBy = req.params.type;
    const sortedProducts = await Product.find().sort({ [sortBy]: -1 });
    if (sortedProducts.length === 0) {
      return res.status(404).json({ message: "no products found" });
    }
    return res
      .status(200)
      .json({ message: `Products sorted by ${sortBy}`, sortedProducts });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error sorting products", error: err.message });
  }
});

// getting low stock products
router.get("/products/low-stock", adminMiddleware, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } });
    if (lowStockProducts.length === 0) {
      return res.status(404).json({ message: "No low stock products found" });
    }
    return res.status(200).json({
      message: "Low stock products retrieved successfully",
      lowStockProducts,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting low stock products",
      error: err.message,
    });
  }
});

// get stats dashboard
router.get("/stats/dashboard", adminMiddleware, async (req, res) => {
  try {
    // Get total number of products
    const totalProducts = await Product.countDocuments();

    // Get total number of orders
    const totalOrders = await Order.countDocuments();

    // Get low stock products count
    const lowStockCount = await Product.countDocuments({
      stock: { $lt: 10 },
    });

    // Get total revenue (sum of all order totals)
    const revenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      lowStockCount,
      totalRevenue: revenue[0]?.total || 0,
    };

    return res.status(200).json({
      message: "Dashboard stats retrieved successfully",
      stats,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error getting stats dashboard", error: err.message });
  }
});

// user purchase history
router.get("/user/:id/purchase-history", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    // Ensure user can only access their own purchase history
    if (req.userExists.id !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this purchase history" });
    }

    const purchaseHistory = await Order.find({ user: userId }).sort({
      createdAt: -1,
    });

    if (purchaseHistory.length === 0) {
      return res.status(404).json({ message: "No purchase history found" });
    }

    return res.status(200).json({
      message: "Purchase history retrieved successfully",
      purchaseHistory,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error retrieving purchase history",
      error: err.message,
    });
  }
});
module.exports = router;
