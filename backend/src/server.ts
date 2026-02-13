import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';
import { logger } from './utils/logger';
import { initSocketIO } from './config/socket';
import os from 'os';
import { Server } from 'http';

// Load environment variables
dotenv.config();

/**
 * Get the local network IP address
 */
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        // Skip internal (loopback) and non-IPv4 addresses
        // Handle both string ('IPv4') and number (4) family values for Node.js compatibility
        // Type assertion needed because Node.js types can vary between versions
        const family = net.family as string | number;
        const isIPv4 = family === 'IPv4' || family === 4;
        if (isIPv4 && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return 'localhost';
}

// Ensure PORT is always a number
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const LOCAL_IP = getLocalIP();

let server: Server | null = null;

// Start server after database connection
const startServer = async (): Promise<void> => {
  try {
    logger.info('🔄 Connecting to MongoDB...');
    await connectDB();
    logger.info('✅ MongoDB connected successfully');
    
    server = app.listen(PORT, HOST, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`📱 Android Emulator: http://10.0.2.2:${PORT}/api`);
      logger.info(`🌐 Local Access: http://localhost:${PORT}/api`);
      logger.info(`💻 Network Access: http://${LOCAL_IP}:${PORT}/api`);
      logger.info(`📱 Physical Device: Use http://${LOCAL_IP}:${PORT}/api in app.json`);
      logger.info('');
      logger.info('🔍 Connection Diagnostics:');
      logger.info(`   • Server is bound to ${HOST} (all network interfaces)`);
      logger.info(`   • Your local IP: ${LOCAL_IP}`);
      logger.info(`   • If connection fails, check:`);
      logger.info(`     1. Windows Firewall allows port ${PORT}`);
      logger.info(`     2. Both devices are on the same WiFi network`);
      logger.info(`     3. app.json has: "apiUrl": "http://${LOCAL_IP}:${PORT}/api"`);
      logger.info('');
    });

    initSocketIO(server);
  } catch (error: any) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`❌ Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});
