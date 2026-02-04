# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd HHD-APP-Backend
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example env file
cp env.example.txt .env

# Edit .env with your MongoDB connection and other settings
```

## Step 3: Start MongoDB

Make sure MongoDB is running locally or update `MONGODB_URI` in `.env` to point to your MongoDB instance.

## Step 4: Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# The server will start on http://localhost:5000
```

## Step 5: Test the API

```bash
# Health check
curl http://localhost:5000/health

# Send OTP (example)
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'
```

## API Base URL

- Development: `http://localhost:5000`
- Production: Update `CORS_ORIGIN` in `.env` to match your frontend URL

## Frontend Integration

Update your frontend API base URL to point to:
- Development: `http://localhost:5000/api`
- Production: `https://your-backend-domain.com/api`

## Next Steps

1. Integrate SMS service for OTP (Twilio, AWS SNS, etc.)
2. Set up AWS S3 for production photo uploads
3. Configure Redis for caching (optional)
4. Set up monitoring and logging
5. Deploy to production (AWS, Heroku, etc.)
