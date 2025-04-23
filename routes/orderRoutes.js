const express = require("express");
const Product = require("../models/product.js");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const Order = require("../models/order.js");
const router = express.Router();

// place an order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      product,
      quantity,
      street,
      city,
      state,
      pincode,
      country,
      paymentMethod,
    } = req.body;

    const userId = req.userExists.id;
    const productDetails = await Product.findOne({ name: product });
    const productId = productDetails._id.toString();

    if (!productDetails) {
      return res.status(404).json({ message: "Product not found" });
    }

    //to add default quantity
    let defQuantity = quantity;
    if (!quantity) {
      defQuantity = 1;
    }

    const shippingAddress = { street, city, state, pincode, country };

    const items = [
      {
        product: productId,
        quantity: defQuantity,
        name: product,
      },
    ];
    const totalAmount = productDetails.price * defQuantity;

    const newOrder = new Order({
      user: userId,
      items,
      shippingAddress,
      paymentMethod,
      totalAmount,
    });
    await newOrder.save();

    return res.status(200).json({ message: "Order Confirmed!", newOrder });
  } catch (err) {
    return res.status(500).json({
      message: "Error placing order",
      error: err.message,
    });
  }
});

// get all orders - admin
router.get("/", adminMiddleware, async (req, res) => {
  try {
    const allOrders = await Order.find({});
    if (allOrders.length == 0) {
      return res.status(404).json({ message: "No orders yet" });
    }

    return res.status(200).json({ message: "All Orders", allOrders });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting all orders",
      error: err.message,
    });
  }
});

// get orderhistory per user
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const yourOrders = await Order.find({ user: req.params.id });
    if (yourOrders.length == 0) {
      return res.status(404).json({ message: "No orders yet" });
    }

    return res.status(200).json({ message: "Your Orders", yourOrders });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting your orders",
      error: err.message,
    });
  }
});

// get single order by id
router.get("/:orderId", authMiddleware, async (req, res) => {
  try {
    const thisOrder = await Order.findById(req.params.orderId);

    if (!thisOrder) {
      return res.status(404).json({ message: "order not found" });
    }

    return res.status(200).json({ message: "Your Orders", thisOrder });
  } catch (err) {
    return res.status(500).json({
      message: "Error getting this order",
      error: err.message,
    });
  }
});

// update order status
router.put("/:orderId/status", adminMiddleware, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const updateOrderStatus = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus },
      { new: true }
    );
    if (!updateOrderStatus) {
      return res.status(404).json({ message: "order not found" });
    }

    await updateOrderStatus.save();
    return res
      .status(200)
      .json({ message: "Order status updated", updateOrderStatus });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating order status",
      error: err.message,
    });
  }
});

// cancel order
router.put("/:orderId", authMiddleware, async (req, res) => {
  try {
    const cancelOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: "Cancelled" },
      { new: true }
    );
    if (!cancelOrder) {
      return res.status(404).json({ message: "order not found" });
    }
    await cancelOrder.save();
    return res.status(200).json({ message: "Order Cancelled!", cancelOrder });
  } catch (err) {
    return res.status(500).json({
      message: "Error cancelling order",
      error: err.message,
    });
  }
});

// update shipping address
router.put("/:orderId/address", authMiddleware, async (req, res) => {
  try {
    const { street, city, state, pincode, country } = req.body;
    const shippingAddress = { street, city, state, pincode, country };
    const updateAddress = await Order.findByIdAndUpdate(
      req.params.orderId,
      { shippingAddress },
      { new: true }
    );
    if (!updateAddress) {
      return res.status(404).json({ message: "order not found" });
    }

    await updateAddress.save();
    return res
      .status(200)
      .json({ message: "shipping address updated", updateAddress });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating shipping address",
      error: err.message,
    });
  }
});

// track order status
router.get("/:orderId/track", authMiddleware, async (req, res) => {
  try {
    const orderDetails = await Order.findById(req.params.orderId);
    if (!orderDetails) {
      return res.status(404).json({ message: "order not found" });
    }
    const trackOrder = orderDetails.orderStatus;

    return res.status(200).json({ message: "Order Status:", trackOrder });
  } catch (err) {
    return res.status(500).json({
      message: "Error tracking order",
      error: err.message,
    });
  }
});

module.exports = router;
