const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const cartRoutes = require("./routes/cartRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
const reviewRoutes = require("./routes/reviewRoutes.js");
const searchAndFilter = require("./routes/searchAndFilter.js");

app.use(express.json());
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connection successful"))
  .catch((err) => {
    console.log("error connecting to DB", err);
  });

app.get("/", (req, res) => {
  res.status(200).json("home route working");
});

app.use("/api", searchAndFilter);

app.use("/api", userRoutes);

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/cart", cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/reviews", reviewRoutes);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
