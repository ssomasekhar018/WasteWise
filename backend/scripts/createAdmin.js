const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  createAdmin();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function createAdmin() {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'ssomasekhar018@gmail.com' });
    
    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      // Create new admin user
      const admin = await User.create({
        username: 'Admin',
        email: 'ssomasekhar018@gmail.com',
        password: 'Somu%2366',
        role: 'admin'
      });
      
      console.log('Admin user created successfully:', admin);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}