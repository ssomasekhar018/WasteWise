const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const path = require('path');
const userRoutes = require('./routes/userRoutes.js');
const complaintRoutes = require('./routes/complaints.js');
const areaManagers = require('./routes/areaManagers.js');
const analyticsRoutes = require('./routes/analytics.js');
const cors = require('cors');
const User = require('./models/User.js');

dotenv.config();
connectDB();

// Create default admin user if it doesn't exist
async function createDefaultAdmin() {
  try {
    const adminExists = await User.findOne({ email: 'ssomasekhar018@gmail.com' });
    
    if (!adminExists) {
      const admin = await User.create({
        username: 'Admin',
        email: 'ssomasekhar018@gmail.com',
        password: 'Somu%2366',
        role: 'admin'
      });
      
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createDefaultAdmin();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://wastewise-management-1.onrender.com",
    "https://wastewise-management.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/users", userRoutes);
// API Routes
app.use('/api/complaints', complaintRoutes);
app.use('/api/area-managers', areaManagers);
app.use('/api/analytics', analyticsRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
