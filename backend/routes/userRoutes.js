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
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    console.log('Signup attempt with data:', req.body);
    const { username, email, password, role = "user", area } = req.body;
    
    console.log('Extracted user data:', { username, email, role, area });

    try {
      const userExists = await User.findOne({ email });
      console.log('User exists check:', userExists ? 'User already exists' : 'Email is available');
      
      if (userExists) {
        res.status(400);
        throw new Error('User already exists');
      }

      console.log('Attempting to create user in database...');
      const user = await User.create({ username, email, password, role, area });
      console.log('User created successfully:', user ? `ID: ${user._id}, Email: ${user.email}` : 'Failed to create user');
      
      if (user) {
        const token = generateToken(user);
        console.log('Generated token for new user');
        
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          area: user.area,
          token: token, 
        });
      } else {
        res.status(400);
        throw new Error('Invalid user data');
      }
    } catch (error) {
      console.error('Error in user signup:', error.message);
      res.status(400).json({ message: error.message });
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

    try {
      // Validate input
      if (!email || !password) {
        console.log('Missing email or password in request');
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await User.findOne({ email });
      console.log('User found:', user ? `ID: ${user._id}, Email: ${user.email}, Role: ${user.role}` : 'No user found');
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isMatch = await user.matchPassword(password);
      console.log('Password match:', isMatch ? 'Yes' : 'No');

      if (isMatch) {
        const token = generateToken(user);
        console.log('JWT token generated successfully for user');
        
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          area: user.area,
          token: token,
        });
      } else {
        return res.status(401).json({ message: "Invalid email or password" });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed", error: error.message });
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
