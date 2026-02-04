# Troubleshooting Guide - "Failed to fetch" Error

## Problem
When clicking "Send OTP" button, you get a "Failed to fetch" error.

## Common Causes & Solutions

### 1. Backend Server Not Running

**Solution:**
```bash
# Navigate to backend directory
cd HHD-APP-Backend

# Start the backend server
npm run dev
```

The server should start on `http://localhost:5000`. You should see:
```
🚀 Server running on port 5000 in development mode
✅ MongoDB connected
```

### 2. MongoDB Not Running

**Solution:**
- **Windows**: Start MongoDB service or run `mongod`
- **Mac**: `brew services start mongodb-community` or `mongod`
- **Linux**: `sudo systemctl start mongod` or `mongod`

Verify MongoDB is running:
```bash
# Check MongoDB connection
mongosh
# or
mongo
```

### 3. Wrong API URL Configuration

**For Different Platforms:**

#### Android Emulator
- Uses: `http://10.0.2.2:5000/api`
- Already configured in `src/config/api.ts`

#### iOS Simulator
- Uses: `http://localhost:5000/api`
- Already configured in `src/config/api.ts`

#### Physical Device
- You need your computer's IP address
- Find your IP:
  ```bash
  # Windows
  ipconfig
  # Look for IPv4 Address (e.g., 192.168.1.100)
  
  # Mac/Linux
  ifconfig
  # or
  ip addr show
  ```
- Update `src/config/api.ts`:
  ```typescript
  return 'http://YOUR_IP_ADDRESS:5000/api';
  // Example: return 'http://192.168.1.100:5000/api';
  ```

#### Web Browser
- Uses: `http://localhost:5000/api`
- Make sure backend CORS allows your web origin

### 4. Firewall Blocking Connection

**Solution:**
- Allow port 5000 through your firewall
- Windows: Windows Defender Firewall → Allow an app → Node.js
- Mac: System Preferences → Security & Privacy → Firewall → Firewall Options

### 5. Network Connectivity

**Solution:**
- Ensure both frontend and backend are on the same network
- For physical devices, ensure device and computer are on the same WiFi network
- Try pinging the backend:
  ```bash
  # From your computer
  curl http://localhost:5000/health
  ```

### 6. CORS Issues

**Solution:**
- Backend CORS is already configured to allow all origins in development
- Check `HHD-APP-Backend/src/app.ts` - CORS should allow all origins in dev mode

### 7. Mobile Number Validation

**Backend Requirements:**
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Pattern: `/^[6-9]\d{9}$/`

**Examples:**
- ✅ Valid: `9876543210`, `6123456789`, `7890123456`
- ❌ Invalid: `1234567890` (starts with 1), `987654321` (9 digits), `98765432101` (11 digits)

## Testing Steps

### Step 1: Verify Backend Health
```bash
# Test backend health endpoint
curl http://localhost:5000/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

### Step 2: Test Send OTP Endpoint
```bash
# Test send OTP API
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile":"9876543210"}'

# Should return:
# {"success":true,"message":"OTP sent successfully","data":{"mobile":"9876543210","otp":"123456"}}
```

### Step 3: Check Frontend Console
- Open browser/Expo DevTools console
- Look for `[API]` log messages
- Check for connection errors

### Step 4: Check Backend Logs
- Look at backend terminal for incoming requests
- Check for errors in backend logs

## Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in HHD-APP-Backend)
- [ ] MongoDB is running and connected
- [ ] Backend health check works: `curl http://localhost:5000/health`
- [ ] API URL is correct for your platform (check `src/config/api.ts`)
- [ ] Firewall allows port 5000
- [ ] Mobile number is valid (10 digits, starts with 6-9)
- [ ] Both devices are on the same network (for physical device testing)

## Still Having Issues?

1. **Check Backend Logs**: Look for errors in the backend terminal
2. **Check Frontend Console**: Look for `[API]` log messages
3. **Test with curl/Postman**: Verify backend endpoints work independently
4. **Check Network Tab**: In browser DevTools, check Network tab for failed requests
5. **Verify .env File**: Ensure backend `.env` file is configured correctly

## Development Mode Features

In development mode, the OTP is returned in the API response and shown in:
- Console log: `✅ OTP generated (dev only): 123456`
- Alert dialog (on successful send)

This helps with testing without needing SMS service integration.
