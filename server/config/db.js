const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.warn('⚠️  MONGO_URI not set in .env — skipping DB connection');
      return false;
    }
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('');
    console.error('💡 To fix this, do ONE of the following:');
    console.error('   1. Install & start MongoDB locally: https://www.mongodb.com/try/download/community');
    console.error('   2. Use free MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
    console.error('      Then update MONGO_URI in server/.env');
    console.error('');
    console.error('⚠️  Server will start but database operations will fail.');
    return false;
  }
};

module.exports = connectDB;
