const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const path = require('path');
const userRoutes = require('./routes/userRoutes.js');
const complaintRoutes = require('./routes/complaints.js');
const areaManagers = require('./routes/areaManagers.js');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/users", userRoutes);
// API Routes
app.use('/api/complaints', complaintRoutes);

app.use('/api/area-managers', areaManagers);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
