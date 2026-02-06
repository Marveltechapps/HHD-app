# HHD App Backend

Backend API for HHD (Hand-Held Device) warehouse order picking application. Built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication** - OTP-based login with mobile number
- **Order Management** - Complete order lifecycle tracking
- **Bag Scanning** - QR code scanning for bags
- **Item Picking** - Real-time item scanning and tracking
- **Rack Management** - Rack location assignment and tracking
- **Task Management** - User task list and tracking
- **Photo Verification** - Upload and verify bag photos
- **Real-time Updates** - Socket.IO for live order updates
- **Security** - JWT authentication, rate limiting, helmet
- **Performance** - Pagination, indexing, caching support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB with Mongoose
- **Validation**: Zod schemas
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer (with S3 support ready)

## Project Structure

```
HHD-APP-Backend/
├── src/
│   ├── api/
│   │   ├── controllers/    # Route controllers
│   │   └── routes/         # API routes
│   ├── config/             # Database, Socket.IO config
│   ├── middleware/         # Auth, error handling
│   ├── models/             # Mongoose models
│   ├── services/           # Business logic (OTP, file upload, socket)
│   ├── utils/              # Logger, constants, ErrorResponse
│   ├── app.ts              # Express app setup
│   └── server.ts            # Server entry point
├── .env.example            # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

```bash
# Navigate to backend directory
cd HHD-APP-Backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hhd-app
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/hhd-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# OTP
OTP_EXPIRE_MINUTES=10
OTP_LENGTH=4

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
# Window in milliseconds (default: 15 minutes = 900000ms)
RATE_LIMIT_WINDOW_MS=900000
# Maximum requests per window (default: 200, increased to avoid 429 errors)
RATE_LIMIT_MAX_REQUESTS=200

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006
```

## Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to mobile number
- `POST /api/auth/verify-otp` - Verify OTP and login
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout (Protected)

### Orders
- `GET /api/orders` - Get all orders (Protected)
- `GET /api/orders/:orderId` - Get single order (Protected)
- `POST /api/orders` - Create new order (Protected)
- `PUT /api/orders/:orderId/status` - Update order status (Protected)
- `GET /api/orders/status/:status` - Get orders by status (Protected)

### Bags
- `POST /api/bags/scan` - Scan bag (Protected)
- `GET /api/bags/:bagId` - Get bag details (Protected)
- `PUT /api/bags/:bagId` - Update bag (Protected)

### Items
- `GET /api/items/order/:orderId` - Get order items (Protected)
- `POST /api/items/scan` - Scan item (Protected)
- `PUT /api/items/:itemId/not-found` - Mark item as not found (Protected)
- `PUT /api/items/:itemId` - Update item (Protected)

### Racks
- `POST /api/racks/scan` - Scan rack QR (Protected)
- `GET /api/racks/:rackCode` - Get rack details (Protected)
- `GET /api/racks/available` - Get available racks (Protected)

### Tasks
- `GET /api/tasks` - Get all tasks (Protected)
- `POST /api/tasks` - Create task (Protected)
- `PUT /api/tasks/:taskId` - Update task (Protected)
- `DELETE /api/tasks/:taskId` - Delete task (Protected)

### Photos
- `POST /api/photos` - Upload bag photo (Protected, multipart/form-data)
- `GET /api/photos/order/:orderId/bag/:bagId` - Get photo (Protected)
- `PUT /api/photos/:photoId/verify` - Verify photo (Protected)

### Users
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

## Socket.IO Events

### Client → Server
- `join:user` - Join user room
- `join:order` - Join order room
- `order:update` - Emit order update

### Server → Client
- `order:updated` - Order status updated
- `order:received` - New order received
- `notification` - User notification

## Development

```bash
# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Testing (when tests are added)
npm test
npm run test:watch
npm run test:coverage
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet for security headers
- CORS configuration
- Input validation
- Error handling middleware

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination support
- Redis caching support (ready for integration)
- Compression middleware
- Query optimization

## Production Deployment

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or managed MongoDB
3. Configure AWS S3 for file uploads
4. Set up Redis for caching
5. Use environment variables for all secrets
6. Enable HTTPS
7. Set up monitoring and logging

## License

Proprietary - Marvel Tech Apps
