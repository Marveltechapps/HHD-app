import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

let io: SocketIOServer;

export const initSocketIO = (httpServer: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'])
        : true, // Allow all origins in development for React Native/Expo
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Join user room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} joined their room`);
    });

    // Join order room
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      logger.info(`Socket ${socket.id} joined order ${orderId}`);
    });

    // Handle order updates
    socket.on('order:update', (data: { orderId: string; status: string }) => {
      io.to(`order:${data.orderId}`).emit('order:updated', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
