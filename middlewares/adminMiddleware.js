const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const adminMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(404).json({ message: "no token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    const userDetails = await User.findById(decoded.id);
    if (userDetails.role !== "admin") {
      return res
        .status(400)
        .json({ message: "You're not authorized for this" });
    }
    req.userExists = decoded;
    next();
  } catch {
    (err) => {
      res.status(400).json({ message: "Unauthorized, token did not match" });
    };
  }
};

module.exports = adminMiddleware;
