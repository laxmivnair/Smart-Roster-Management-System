const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/datastraw_roster';
    console.log(`[DB] Attempting MongoDB connection to: ${uri}`);

    // Try standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[DB] MongoDB Connected Successfully: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
  } catch (err) {
    console.warn(`[DB] Local/Configured MongoDB connection failed: ${err.message}`);
    console.log(`[DB] Starting embedded MongoMemoryServer fallback for seamless evaluation...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'datastraw_roster',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[DB] Connected to in-memory MongoDB fallback: ${memoryUri}`);
    } catch (fallbackErr) {
      console.error(`[DB] Critical: Failed to initialize in-memory MongoDB:`, fallbackErr.message);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[DB] MongoDB Disconnected cleanly.');
  } catch (err) {
    console.error('[DB] Error during disconnection:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
