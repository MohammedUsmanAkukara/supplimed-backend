import mongoose from 'mongoose';
import { config } from './env.js';

let memoryServerInstance = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  if (isDbConnected()) {
    return mongoose.connection;
  }

  const opts = {
    dbName: config.mongodbDb,
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    autoIndex: true
  };

  const safeUri = config.mongodbUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  // 1. Attempt connection to configured URI (Atlas or local daemon) with retry
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[MongoDB] Connecting to ${safeUri} (attempt ${attempt}/${maxRetries})...`);
      const conn = await mongoose.connect(config.mongodbUri, opts);
      if (mongoose.connection.readyState === 1) {
        console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${config.mongodbDb}`);
        return conn;
      }
    } catch (error) {
      console.warn(`[MongoDB] Connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        console.log('[MongoDB] Retrying in 2 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  console.warn(`[MongoDB] Primary connection to ${safeUri} failed.`);
  console.warn('[MongoDB] Hint: If using MongoDB Atlas, verify your IP is whitelisted under Network Access: https://cloud.mongodb.com -> Network Access');

  // 2. In non-production, spin up embedded MongoMemoryServer fallback so development is never blocked
  if (config.nodeEnv !== 'production') {
    try {
      console.log('[MongoDB] Starting embedded MongoDB development instance (fallback)...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create();
      const memUri = memoryServerInstance.getUri();

      const conn = await mongoose.connect(memUri, {
        dbName: config.mongodbDb,
        autoIndex: true
      });
      console.log(`[MongoDB] Embedded fallback MongoDB running at: ${memUri}`);

      // Ensure default superadmin account exists in the fallback instance
      try {
        const { User } = await import('../models/User.js');
        const adminEmail = 'admin@supplimed.in';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
          await User.create({
            name: 'Super Admin',
            email: adminEmail,
            password: 'SupplimedAdmin2026!',
            role: 'SUPER_ADMIN',
            isActive: true
          });
          console.log(`[MongoDB] Default dev superadmin created: ${adminEmail} (password: SupplimedAdmin2026!)`);
        }
      } catch (seedErr) {
        console.warn(`[MongoDB] Fallback admin initialization: ${seedErr.message}`);
      }

      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Failed to start embedded instance: ${memErr.message}`);
    }
  }

  return null;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from database');
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB] Runtime error: ${err.message}`);
});

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed');
  }
  if (memoryServerInstance) {
    await memoryServerInstance.stop();
    memoryServerInstance = null;
  }
};
