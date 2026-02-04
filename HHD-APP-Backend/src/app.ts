import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { logger } from './utils/logger';
import { isConnected } from './config/database';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './api/routes/auth.routes';
import orderRoutes from './api/routes/order.routes';
import bagRoutes from './api/routes/bag.routes';
import itemRoutes from './api/routes/item.routes';
import rackRoutes from './api/routes/rack.routes';
import taskRoutes from './api/routes/task.routes';
import photoRoutes from './api/routes/photo.routes';
import userRoutes from './api/routes/user.routes';
import scannedItemRoutes from './api/routes/scannedItem.routes';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
// For React Native/Expo, allow all origins in development
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'])
    : true, // Allow all origins in development for React Native/Expo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files (uploads)
const uploadPath = process.env.UPLOAD_PATH || './uploads';
app.use('/uploads', express.static(path.resolve(uploadPath)));

// Health check
app.get('/health', (req, res) => {
  const dbConnected = isConnected();
  const dbState = mongoose.connection.readyState;
  const dbStateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'OK' : 'SERVICE_UNAVAILABLE',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbConnected,
      state: dbStateNames[dbState as keyof typeof dbStateNames] || 'unknown',
      readyState: dbState,
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bags', bagRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scanned-items', scannedItemRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
