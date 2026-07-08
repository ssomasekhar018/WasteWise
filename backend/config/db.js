const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI exists' : 'URI is missing');
    
    // Set mongoose options for better debugging
    mongoose.set('debug', true);
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log database connection status
    console.log(`MongoDB Connection State: ${mongoose.connection.readyState}`);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    // Test database connection with a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
