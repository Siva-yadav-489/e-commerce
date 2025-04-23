const express = require("express");
const Product = require("../models/product.js");
const Review = require("../models/review.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

// add a review
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    const productDetails = await Product.findOne({ name });
    const productId = productDetails._id;
    const userId = req.userExists.id;
    productDetails.rating = rating;
    await productDetails.save();
    const newReview = new Review({
      user: userId,
      product: productId,
      name,
      rating,
      comment,
    });

    await newReview.save();
    return res
      .status(200)
      .json({ message: "review added successfully", newReview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error adding review", error: err.message });
  }
});

// get reviews for a product
router.get("/product/:productId", authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId });
    if (reviews.length === 0) {
      return res.status(404).json({ message: "no reviews yet" });
    }

    return res
      .status(200)
      .json({ message: "review for this product", reviews });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting reviews for this product",
      error: err.message,
    });
  }
});

// get reviews by a user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userReviews = await Review.find({ user: req.params.userId });
    if (userReviews.length === 0) {
      return res.status(404).json({ message: "no reviews yet" });
    }

    return res
      .status(200)
      .json({ message: "reviews by this user", userReviews });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting reviews from this user",
      error: err.message,
    });
  }
});

// edit a review
router.put("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    if (rating) {
      const productDetails = await Product.findOne({ name });
      productDetails.rating = rating;
      await productDetails.save();
    }
    const editReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { name, rating, comment },
      { new: true }
    );
    if (!editReview) {
      return res.status(404).json({ message: "no such review" });
    }

    await editReview.save();
    return res.status(200).json({ message: "review updated!", editReview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error editing the review", error: err.message });
  }
});

// delete a review
router.delete("/:reviewId", authMiddleware, async (req, res) => {
  try {
    const deleteReview = await Review.findByIdAndDelete(req.params.reviewId);
    if (!deleteReview) {
      return res.status(404).json({ message: "no such review" });
    }

    return res.status(200).json({ message: "review deleted!", deleteReview });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting the review", error: err.message });
  }
});

module.exports = router;
