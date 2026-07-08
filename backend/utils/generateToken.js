const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = { 
    id: user._id, 
    email: user.email, 
    role: user.role, 
    area: user.area 
  };
  
  console.log('Generating token with payload:', payload);
  
  const token = jwt.sign(
    payload, 
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  return token;
};

module.exports = generateToken;
