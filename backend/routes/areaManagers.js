const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authMiddleware } = require("../middleware/authMiddleware");
const AreaManager = require('../models/AreaManager');

// ...existing code...
// Route to create a new area manager (municipal admin)
router.post('/', async (req, res) => {
  try {
    const { NIC_no, first_name, last_name, area, email, password } = req.body;
    console.log('Manager creation attempt:', { NIC_no, email });

    // Validate required fields
    if (!NIC_no || !first_name || !last_name || !area || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: "All fields are required: NIC, name, area, email, and password"
      });
    }

    // Check for existing records using parallel queries
    const [existingNIC, existingEmail] = await Promise.all([
      AreaManager.findOne({ NIC_no }),
      AreaManager.findOne({ email })
    ]);

    if (existingNIC || existingEmail) {
      console.log('Duplicate detected:', {
        NIC_exists: !!existingNIC,
        email_exists: !!existingEmail
      });
      return res.status(409).json({
        message: "Registration conflict",
        errors: {
          ...(existingNIC && { NIC_no: "NIC number already registered" }),
          ...(existingEmail && { email: "Email already in use" })
        }
      });
    }

    // Hash password with async/await
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create manager with proper error handling
    const newManager = await AreaManager.create({
      NIC_no,
      first_name,
      last_name,
      area,
      email,
      password: hashedPassword
    });

    console.log('Manager created successfully:', newManager._id);
    res.status(201).json({
      _id: newManager._id,
      email: newManager.email,
      area: newManager.area,
      message: "Area manager registered successfully"
    });

  } catch (err) {
    console.error('Manager Creation Error:', err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const keyPattern = Object.keys(err.keyPattern);
      return res.status(409).json({
        message: "Duplicate entry detected",
        errors: keyPattern.reduce((acc, key) => ({
          ...acc,
          [key]: `${key.toUpperCase()} already exists`
        }), {})
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});
// ...existing code...

// Route to get all area managers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const areaManagers = await AreaManager.find();
    res.status(200).json(areaManagers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch area managers.', error: err.message });
  }
});

// Route to get a single area manager by NIC_no
router.get('/:NIC_no', authMiddleware, async (req, res) => {
  try {
    const manager = await AreaManager.findOne({ NIC_no: req.params.NIC_no });
    if (!manager) {
      return res.status(404).json({ message: 'Area manager not found.' });
    }
    res.status(200).json(manager);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch area manager.', error: err.message });
  }
});

router.put('/:NIC_no', authMiddleware, async (req, res) => {
    const { NIC_no, first_name, last_name, area, email, password } = req.body;
  
    try {
      const manager = await AreaManager.findOne({ NIC_no: req.params.NIC_no });
      if (!manager) {
        return res.status(404).json({ message: 'Area manager not found.' });
      }
  
      manager.first_name = first_name || manager.first_name;
      manager.last_name = last_name || manager.last_name;
      manager.area = area || manager.area;
      manager.email = email || manager.email;
      if (password) {
        manager.password = await bcrypt.hash(password, 10); // Encrypt new password
      }
  
      await manager.save();
      res.status(200).json(manager);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update area manager.', error: err.message });
    }
  });
  

// Route to delete an area manager
router.delete('/:NIC_no', authMiddleware, async (req, res) => {
    try {
      const manager = await AreaManager.findOne({ NIC_no: req.params.NIC_no });
      if (!manager) {
        return res.status(404).json({ message: 'Area manager not found.' });
      }
  
      await manager.remove();
      res.status(200).json({ message: 'Area manager deleted successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to delete area manager.', error: err.message });
    }
  });




  const jwt = require("jsonwebtoken");

// Route to login area manager
// ...existing code...

router.post('/manager-login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Manager login attempt with email:', email);

  try {
    if (!email || !password) {
      console.log('Missing email or password in request');
      return res.status(400).json({ message: "Email and password are required" });
    }

    const manager = await AreaManager.findOne({ email });   
    console.log('Manager found:', manager ? 'Yes' : 'No');
    
    if (!manager) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // bcrypt password check
    console.log(manager.password);
    
    const isMatch = await manager.matchPassword(password);
    console.log(isMatch);
    

    // Generate JWT token
    const token = jwt.sign(
      { id: manager._id, email: manager.email, area: manager.area, role: "manager" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log('JWT token generated successfully');

    res.status(200).json({
      token,
      manager: {
        NIC_no: manager.NIC_no,
        first_name: manager.first_name,
        last_name: manager.last_name,
        email: manager.email,
        area: manager.area,
        role: "manager",
      },
    });
  } catch (err) {
    console.error('Manager login error:', err);
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
});



module.exports = router;
