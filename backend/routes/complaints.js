const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { authMiddleware } = require('../middleware/authMiddleware');

const Complaint = require("../models/Complaint");

// Setup image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage: storage });

// Route to submit a complaint
// ...existing code...
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { location, mapLocation, description, username, wasteType, email } = req.body;

    if (!location || !description || !wasteType || !mapLocation) {
      return res.status(400).json({ message: "Location, mapLocation, description, and waste type are required." });
    }

    let parsedLocation;
    try {
      parsedLocation = JSON.parse(mapLocation);
    } catch (e) {
      return res.status(400).json({ message: "Invalid mapLocation format." });
    }

    const image = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

    const complaint = new Complaint({
      complaint_id: Date.now().toString(),
      username,
      email,
      location: parsedLocation, // coordinates object
      area: location,           // area name (text)
      description,
      image,
      wasteType,
    });

    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ message: "Failed to submit complaint.", error: err.message });
  }
});
// ...existing code...

// Route to fetch all complaints
router.get("/", authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find(); 
    res.status(200).json(complaints); 
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch complaints." });
  }
});




// Route to fetch complaints by logged-in user
router.get("/my-complaints", authMiddleware, async (req, res) => {
  try {
    console.log("Request received at /my-complaints with user:", req.user);

    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ message: "Email information not available in the token." });
    }

    const complaints = await Complaint.find({ email });
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ message: "Failed to fetch user complaints." });
  }
});




// Route to fetch complaints for the logged-in area manager's area
router.get("/area", authMiddleware, async (req, res) => {
  try {
    const { area } = req.user;

    if (!area) {
      return res.status(400).json({ message: "Area information not available in the token." });
    }

   
    const complaints = await Complaint.find({ area, status: "accepted" });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching complaints for area:", err);
    res.status(500).json({ message: "Failed to fetch complaints for the area." });
  }
});




// Route to update the status of a complaint
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  try {
    const complaint = await Complaint.findOneAndUpdate(
      { complaint_id: id }, 
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ message: "Failed to update complaint status." });
  }
});



// Update complaint progress
router.patch("/:id/progress", authMiddleware, async (req, res) => {
  try {
    const { progress } = req.body;
    const allowedProgress = ["Recorded", "In Progress", "Resolved"];
    if (!allowedProgress.includes(progress)) {
      return res.status(400).json({ message: "Invalid progress status." });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaint_id: req.params.id },
      { progress },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ message: "Failed to update progress." });
  }
});






module.exports = router;
