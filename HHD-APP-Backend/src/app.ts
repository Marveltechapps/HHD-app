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

// Rate limiting configuration
// More lenient limits to avoid 429 errors
const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const rateLimitMaxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '200', 10); // Increased from 100 to 200

// General API rate limiter (more lenient)
const generalLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(rateLimitWindowMs / 1000), // Retry after in seconds
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
  // Custom handler to include Retry-After header
  handler: (req, res) => {
    const retryAfter = Math.ceil(rateLimitWindowMs / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: retryAfter,
    });
  },
});

// Stricter rate limiter for authentication endpoints (to prevent abuse)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 OTP requests per 15 minutes per IP
  message: {
    error: 'Too many authentication requests',
    message: 'Too many authentication attempts. Please try again later.',
    retryAfter: 900, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.setHeader('Retry-After', 900);
    res.status(429).json({
      success: false,
      error: 'Too many authentication requests',
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      retryAfter: 900,
    });
  },
});

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

// Health check (before rate limiting)
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

// Apply rate limiters (after health check)
// Apply general rate limiter to all API routes
app.use('/api/', generalLimiter);

// Apply stricter rate limiter to authentication routes
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

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
