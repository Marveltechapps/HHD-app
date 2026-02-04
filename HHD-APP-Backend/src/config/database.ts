import mongoose from 'mongoose';
import { logger } from '../utils/logger';

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 seconds
let eventListenersInitialized = false;

const reconnectToMongoDB = (): void => {
  if (mongoose.connection.readyState === 0) { // 0 = disconnected
    reconnectAttempts++;
    
    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_DELAY * Math.min(reconnectAttempts, 5); // Cap at 25 seconds
      logger.info(`🔄 Reconnecting in ${delay / 1000} seconds... (Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      
      setTimeout(() => {
        connectDB().catch((err) => {
          logger.error(`❌ Reconnection attempt ${reconnectAttempts} failed: ${err.message}`);
        });
      }, delay);
    } else {
      logger.error(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check MongoDB service.`);
      logger.error('💡 Make sure MongoDB is running: mongod (or start MongoDB service)');
    }
  }
};

// Initialize event listeners only once
const initializeEventListeners = (): void => {
  if (eventListenersInitialized) return;
  
  // Handle connection events
  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB disconnected - attempting to reconnect...');
    reconnectToMongoDB();
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('✅ MongoDB reconnected successfully');
    reconnectAttempts = 0;
  });

  mongoose.connection.on('connecting', () => {
    logger.info('🔄 Connecting to MongoDB...');
  });

  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB connection established');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed through app termination');
    process.exit(0);
  });

  eventListenersInitialized = true;
};

const connectDB = async (): Promise<void> => {
  try {
    // Initialize event listeners on first call
    initializeEventListeners();

    // If already connected, return immediately
    if (mongoose.connection.readyState === 1) {
      logger.info('✅ MongoDB already connected');
      return;
    }

    const mongoURI =
      process.env.NODE_ENV === 'production'
        ? process.env.MONGODB_URI_PROD
        : process.env.MONGODB_URI || 'mongodb://localhost:27017/hhd-app';

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined');
    }

    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
      retryWrites: true,
      retryReads: true,
    };

    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    reconnectAttempts = 0; // Reset on successful connection
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error}`);
    reconnectAttempts++;
    
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      logger.info(`🔄 Retrying MongoDB connection (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
      setTimeout(() => {
        connectDB();
      }, RECONNECT_DELAY * reconnectAttempts); // Exponential backoff
    } else {
      logger.error(`❌ Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Please check MongoDB service.`);
      throw error; // Throw error instead of exiting to allow server to handle it
    }
  }
};

/**
 * Check if MongoDB is connected
 * @returns true if connected, false otherwise
 */
const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

/**
 * Wait for MongoDB connection with timeout
 * @param timeoutMs - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise that resolves when connected or rejects on timeout
 */
const waitForConnection = async (timeoutMs: number = 10000): Promise<void> => {
  if (isConnected()) {
    return;
  }

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkConnection = () => {
      if (isConnected()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeoutMs) {
        reject(new Error('MongoDB connection timeout'));
        return;
      }
      
      setTimeout(checkConnection, 100); // Check every 100ms
    };
    
    checkConnection();
  });
};

export { connectDB, isConnected, waitForConnection };
