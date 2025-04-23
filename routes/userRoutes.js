const express = require("express");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middlewares/adminMiddleware.js");
const authMiddleware = require("../middlewares/authMiddleware.js");
const router = express.Router();

// register
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      street,
      city,
      state,
      pincode,
      country,
      role,
    } = req.body;

    const isMatch = await User.findOne({ email });
    if (isMatch) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      address: {
        street,
        city,
        state,
        pincode,
        country,
      },
      role,
    });
    await newUser.save();
    return res.status(201).json({
      message: "User registered successfully",
      name: newUser.name,
      email: newUser.email,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error registering user", error: err.message });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ message: "User deos not exist" });
    }
    const match = await bcrypt.compare(password, userExists.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    return res
      .status(200)
      .json({ message: "Login successful", token, id: userExists.id });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "error logging in", error: err.message });
  }
});

// get all users
router.get("/users", adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      return res.status(404).json({ message: "No users yet" });
    }
    return res.status(200).json({ message: "All users: ", users });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error getting all users", error: err.message });
  }
});

// get user by id
router.get("/users/:id", authMiddleware, async (req, res) => {
  try {
    const userDetails = await User.findById(req.params.id);
    if (!userDetails) {
      return res.status(404).json({ message: "user not found" });
    }
    return res
      .status(200)
      .json({ message: `User with id:${req.params.id}`, userDetails });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error getting user details", error: err.message });
  }
});

// get user address
router.get("/users/:id/address", authMiddleware, async (req, res) => {
  try {
    const userDetails = await User.findById(req.params.id);
    if (!userDetails) {
      return res.status(404).json({ message: "user not found" });
    }
    const userAddress = userDetails.address;
    if (!userAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    return res.status(200).json({
      message: `Address of user having id:${req.params.id}`,
      userAddress,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error getting user address", error: err.message });
  }
});

// update user details
router.put("/users/:id", authMiddleware, async (req, res) => {
  try {
    const { name, email, password, street, city, state, pincode, country } =
      req.body;

    const updateData = {
      name,
      email,
      address: {
        street,
        city,
        state,
        pincode,
        country,
      },
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updateUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });
    if (!updateUser) {
      return res.status(404).json({ message: "user not found" });
    }
    await updateUser.save();
    return res
      .status(200)
      .json({ message: "Updated successfully", updateUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating user details", error: err.message });
  }
});

// update user role
router.put("/users/:id/role", authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );
    if (!updateUser) {
      return res.status(404).json({ message: "user not found" });
    }
    await updateUser.save();
    return res
      .status(200)
      .json({ message: "Updated role successfully", updateUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating role", error: err.message });
  }
});

//delete user
router.delete("/users/:id", adminMiddleware, async (req, res) => {
  try {
    const deleteUser = await User.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      return res.status(404).json({ message: "user not found" });
    }
    return res
      .status(200)
      .json({ message: "Deleted successfully", deleteUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error deleting user details", error: err.message });
  }
});

module.exports = router;
