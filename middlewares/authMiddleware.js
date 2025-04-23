const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(404).json({ message: "no token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userExists = decoded;
    next();
  } catch {
    (err) => {
      res.status(400).json({ message: "Unauthorized, token did not match" });
    };
  }
};

module.exports = authMiddleware;
