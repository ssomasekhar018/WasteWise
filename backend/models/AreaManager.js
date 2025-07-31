const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const areaManagerSchema = new mongoose.Schema({
  NIC_no: { type: String, required: true, unique: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  area: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

areaManagerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const AreaManager = mongoose.model("AreaManager", areaManagerSchema);
module.exports = AreaManager;