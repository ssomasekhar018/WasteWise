const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const tokenBlacklist = require('../utils/tokenBlacklist');


const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // Check if token is blacklisted
      if (await tokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
});


const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  tokenBlacklist.has(token).then(isBlacklisted => {
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(400).json({ message: "Invalid token." });
    }
  });
};


module.exports = { protect, authMiddleware };


