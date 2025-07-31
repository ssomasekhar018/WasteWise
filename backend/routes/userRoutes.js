const express = require('express');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { protect } = require('../middleware/authMiddleware.js');
const tokenBlacklist = require('../utils/tokenBlacklist');

const router = express.Router();

// @desc Logout user (blacklist JWT)
// @route POST /api/users/logout
// @access Public
router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.decode(token);
    const exp = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600; // seconds until expiry
    await tokenBlacklist.add(token, exp > 0 ? exp : 3600); // fallback to 1hr if exp missing
  }
  res.json({ message: 'Logged out successfully' });
});


// Generate JWT Token with email included
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email }, 
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};



// @desc Register a new user
// @route POST /api/users/signup
// @access Public
// ...existing code...
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { username, email, password, role = "user", area } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = await User.create({ username, email, password, role, area });
    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        area: user.area,
        token: generateToken(user), 
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);
// ...existing code...






// @desc Authenticate user & get token
// @route POST /api/users/login
// @access Public
// ...existing code...
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt with:', { email, password: password ? '[REDACTED]' : 'undefined' });

    const user = await User.findOne({ email });
    console.log('User found:', user ? `ID: ${user._id}, Email: ${user.email}` : 'No user found');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        area: user.area,
        token: generateToken(user),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);
// ...existing code...



// @desc Get user profile
// @route GET /api/users/me
// @access Private
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (user) {
      res.json({ _id: user._id, username: user.username, email: user.email });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  })
);




module.exports = router;
