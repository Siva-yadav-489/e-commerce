const express = require("express");
const Product = require("../models/product.js");
const Cart = require("../models/cart.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const router = express.Router();

// to show items in cart
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.find({ user: req.userExists.id });
    if (cartItems.length === 0) {
      return res.status(404).json({ message: "Your cart is empty" });
    }
    return res.status(200).json({ message: "Cart items:", cartItems });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error getting cart items", error: err.message });
  }
});

// to add items to cart
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.userExists.id;

    //take product name, quantity from body
    const { product, quantity } = req.body;
    const productDetails = await Product.find({ name: product });
    const productId = productDetails[0]._id.toString();

    if (!productDetails) {
      return res.status(404).json({ message: "Product not found" });
    }

    //to add default quantity
    let defQuantity = quantity;
    if (!quantity) {
      defQuantity = 1;
    }

    const items = [
      {
        product: productId,
        quantity: defQuantity,
        name: productDetails[0].name,
      },
    ];
    const totalPrice = productDetails[0].price * defQuantity;

    const cartExists = await Cart.findOne({ user: userId });

    // if cart is not created
    if (!cartExists) {
      const addToCart = new Cart({ user: userId, items, totalPrice });
      await addToCart.save();
      return res.status(200).json({ message: "Added to cart!", addToCart });
    }

    // if cart already exists and product already exists
    const productIndex = cartExists.items.findIndex(
      (item) => item.name === productDetails[0].name
    );

    if (productIndex !== -1) {
      // Update quantity of existing item
      cartExists.items[productIndex].quantity += defQuantity;
      cartExists.totalPrice += totalPrice;
      await cartExists.save();
      return res.status(200).json({
        message: "Product already exists, Updated quantity in cart!",
        cart: cartExists,
      });
    }

    //if cart already exists and product not exists
    cartExists.items.push({
      quantity: defQuantity,
      product: productId,
      name: productDetails[0].name,
    });
    cartExists.totalPrice += totalPrice;
    await cartExists.save();

    const addToCart = cartExists;

    return res.status(200).json({ message: "Added to cart!", addToCart });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error adding items to cart", error: err.message });
  }
});

//remove item from cart
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userExists.id;
    const { productId } = req.params;

    const cartExists = await Cart.findOne({ user: userId });

    if (!cartExists) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productInfo = await Product.findById(productId);

    if (!productInfo) {
      return res.status(404).json({ message: "no such Product" });
    }

    //find the product
    const productIndex = cartExists.items.findIndex(
      (item) => item.name === productInfo.name
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "no such item in cart" });
    }

    //remove product from cart
    const removedItem = cartExists.items.splice(productIndex, 1)[0];
    cartExists.totalPrice -= removedItem.quantity * productInfo.price;

    await cartExists.save();

    //if cart becomes empty
    if (cartExists.items.length === 0) {
      await Cart.findByIdAndDelete(cartExists._id);
      return res.status(404).json({ message: "Cart is empty" });
    }

    return res
      .status(200)
      .json({ message: "Item removed from cart", cartExists });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error removing item from cart", error: err.message });
  }
});

//update quantity of cart item
router.put("/update/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.userExists.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cartExists = await Cart.findOne({ user: userId });

    if (!cartExists) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productInfo = await Product.findById(productId);

    if (!productInfo) {
      return res.status(404).json({ message: "Product not found" });
    }

    //find product
    const productIndex = cartExists.items.findIndex(
      (item) => item.name === productInfo.name
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    //remove existing item
    const removedItem = cartExists.items.splice(productIndex, 1)[0];
    cartExists.totalPrice -= removedItem.quantity * productInfo.price;

    //add item with updated quantity
    const totalPrice = productInfo.price * quantity;
    cartExists.items.push({
      quantity: quantity,
      product: productId,
      name: productInfo.name,
    });
    cartExists.totalPrice += totalPrice;

    await cartExists.save();

    return res
      .status(200)
      .json({ message: "Cart updated successfully", cartExists });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating cart item quantity",
      error: err.message,
    });
  }
});

// clear cart
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const userId = req.userExists.id;

    const cartDetails = await Cart.find({ user: userId });
    if (cartDetails.length === 0) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const clearCart = await Cart.findByIdAndDelete(cartDetails[0]._id);
    return res.status(200).json({ message: "Cart cleared!", clearCart });
  } catch (err) {
    return res.status(500).json({
      message: "Error clearing cart",
      error: err.message,
    });
  }
});

// manually update cart total
router.put("/total/:userId", adminMiddleware, async (req, res) => {
  try {
    const { totalPrice } = req.body;
    const cartDetails = await Cart.find({ user: req.params.userId });
    if (!cartDetails) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // price is not updated if it is same as before
    if (totalPrice == cartDetails[0].totalPrice) {
      return res.status(404).json({ message: "Total price is same as before" });
    }

    const updateTotal = await Cart.findByIdAndUpdate(
      cartDetails[0]._id,
      { totalPrice: totalPrice },
      { new: true }
    );
    return res.status(200).json({ message: "Updated totalPrice", updateTotal });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating cart total",
      error: err.message,
    });
  }
});

module.exports = router;
