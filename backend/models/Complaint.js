const mongoose = require("mongoose");

// ...existing code...
const ComplaintSchema = new mongoose.Schema({
  complaint_id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  description: { type: String, required: true },
  location: { type: Object, required: true }, // coordinates
  area: { type: String, required: true },     // area name
  wasteType: { type: String, required: true },
  image: { type: String },
  status: { type: String, default: "pending" },
  progress: { type: String, default: "Recorded" },
});
// ...existing code...


module.exports = mongoose.model("Complaint", ComplaintSchema);
