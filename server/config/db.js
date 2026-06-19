const mongoose = require('mongoose');
const dns = require('dns');

// Configure custom DNS servers to resolve MongoDB SRV records correctly, 
// fixing issues with certain ISPs (like Reliance Jio) that fail inside Node's default resolver.
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('⚠️ Unable to set custom DNS servers, using system default:', err.message);
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vibespace';

  // Set up connection event listeners for a smoother dev experience
  mongoose.connection.on('connecting', () => {
    console.log('🔄 Connecting to MongoDB Database...');
  });

  mongoose.connection.on('connected', () => {
    console.log('✨ MongoDB Connected Successfully!');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB Disconnected. Attempting to reconnect...');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination.');
    process.exit(0);
  });

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s for a faster feedback loop
    });
    console.log(`📡 Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Initial MongoDB Connection Failed: ${error.message}`);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Make sure your current IP address is whitelisted in MongoDB Atlas (Network Access).');
    console.log('2. Double check if the username/password in server/.env are correct.');
    console.log('3. Verify that you have an active internet connection.\n');
  }
};

module.exports = connectDB;
