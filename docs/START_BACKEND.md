# How to Start the Backend Server

## Quick Start

1. **Open a new terminal window**

2. **Navigate to backend directory:**
   ```bash
   cd HHD-APP-Backend
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

4. **You should see:**
   ```
   🚀 Server running on port 5000 in development mode
   ✅ MongoDB connected
   ```

## Prerequisites

### 1. MongoDB Must Be Running

**Windows:**
- Check if MongoDB service is running in Services
- Or start manually: `mongod`

**Mac:**
```bash
brew services start mongodb-community
# or
mongod
```

**Linux:**
```bash
sudo systemctl start mongod
# or
mongod
```

### 2. Environment File

Make sure `.env` file exists in `HHD-APP-Backend/` directory with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hhd-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## Verify Backend is Running

### Test Health Endpoint:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...
}
```

### Test Send OTP:
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d "{\"mobile\":\"9876543210\"}"
```

Should return:
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobile": "9876543210",
    "otp": "123456"
  }
}
```

## Troubleshooting

### Port 5000 Already in Use
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -i :5000

# Kill the process or change PORT in .env
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env` file
- Try: `mongosh` to test MongoDB connection

### Module Not Found Errors
```bash
cd HHD-APP-Backend
npm install
```

## Running in Background

**Windows (PowerShell):**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd HHD-APP-Backend; npm run dev"
```

**Mac/Linux:**
```bash
cd HHD-APP-Backend
npm run dev &
```
