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
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@wastewise.com',
      role: 'admin'
    });
    
    if (!adminExists) {
      const admin = await User.create({
        username: 'System Admin',
        email: process.env.ADMIN_EMAIL || 'admin@wastewise.com',
        password: process.env.ADMIN_PASSWORD || 'SecureAdminPass123!',
        role: 'admin'
      });
      console.log('Default admin created:', {
        id: admin._id,
        email: admin.email,
        role: admin.role
      });
    } else {
      console.log('Existing admin user:', {
        id: adminExists._id,
        email: adminExists.email
      });
    }
  } catch (error) {
    console.error('Admin creation error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'hidden'
    });
  }
}

createDefaultAdmin();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://wastewise-management-1.onrender.com",
    "https://wastewise-management.onrender.com",
    "https://wastewise-1-v9qh.onrender.com"
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



// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit the process in production, but log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`API URL: ${process.env.MONGO_URI ? 'MongoDB URI configured' : 'MongoDB URI missing'}`);
});
