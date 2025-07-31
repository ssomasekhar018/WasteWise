const jwt = require("jsonwebtoken");

// ...existing code...
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, area: user.area }, 
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};
// ...existing code...

module.exports = generateToken;
