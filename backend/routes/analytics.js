const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");


// Route to get total, pending, and rejected complaints by area
router.get("/complaints-by-area-detailed", async (req, res) => {
  try {
    const complaintsData = await Complaint.aggregate([
      {
        $group: {
          _id: "$area",
          totalComplaints: { $sum: 1 }, 
          pendingComplaints: {
            $sum: {
              $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
            },
          }, 
          rejectedComplaints: {
            $sum: {
              $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0],
            },
          }, 
        },
      },
      {
        $sort: { totalComplaints: -1 },
      },
    ]);

    res.status(200).json(complaintsData);
  } catch (err) {
    console.error("Error fetching detailed complaints by area:", err);
    res.status(500).json({ message: "Failed to fetch complaints by area." });
  }
});



// Route to fetch complaints by status (resolved, pending, rejected)
router.get("/complaints-by-status", async (req, res) => {
  try {
    const complaintsData = await Complaint.aggregate([
      {
        $group: {
          _id: "$status", 
          count: { $sum: 1 }, 
        },
      },
      {
        $sort: { count: -1 }, 
      },
    ]);

    res.status(200).json(complaintsData); 
  } catch (err) {
    console.error("Error fetching complaints by status:", err);
    res.status(500).json({ message: "Failed to fetch complaints by status." });
  }
});


// Route to fetch complaints by progress status
router.get("/complaints-by-progress",  async (req, res) => {
  try {
    const progressCount = await Complaint.aggregate([
      { $group: { _id: "$progress", count: { $sum: 1 } } }, 
      { $sort: { _id: 1 } }, 
    ]);

    res.status(200).json(progressCount);
  } catch (err) {
    console.error("Error fetching complaints by progress:", err);
    res.status(500).json({ message: "Failed to fetch complaints by progress." });
  }
});


module.exports = router;
