# Quick Start Guide - Fix "Network request failed" Error

## ✅ Backend Server is Now Running!

The backend server has been started successfully. Here's what to do:

## Step 1: Verify Backend is Running

Open a browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{"status":"OK","timestamp":"...","uptime":...}
```

## Step 2: Check Your Platform

The API URL depends on where you're running the app:

### 🌐 **Web Browser (Expo Web)**
- URL: `http://localhost:5000/api`
- ✅ Should work automatically

### 📱 **Android Emulator**
- URL: `http://10.0.2.2:5000/api`
- ✅ Already configured in `src/config/api.ts`

### 🍎 **iOS Simulator**
- URL: `http://localhost:5000/api`
- ✅ Already configured in `src/config/api.ts`

### 📲 **Physical Device**
- You need your computer's IP address
- Find it: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Update `src/config/api.ts`:
  ```typescript
  return 'http://YOUR_IP_ADDRESS:5000/api';
  // Example: return 'http://192.168.1.100:5000/api';
  ```

## Step 3: Test the Connection

1. **Open your app**
2. **Enter a mobile number** (10 digits starting with 6-9)
3. **Click "Send OTP"**
4. **Check the console** for `[API]` logs showing the URL being used

## Step 4: If Still Getting Errors

### Check Console Logs
Look for these messages:
- `[API] POST Request to: http://...`
- `[API] Base URL: http://...`
- `[API] Response status: ...`

### Common Issues:

1. **Wrong Platform URL**
   - Check console logs to see what URL is being used
   - Update `src/config/api.ts` if needed

2. **Backend Stopped**
   - Check if backend terminal is still running
   - Restart: `cd HHD-APP-Backend && npm run dev`

3. **Firewall Blocking**
   - Allow port 5000 through Windows Firewall
   - Or temporarily disable firewall for testing

4. **MongoDB Not Running**
   - Backend needs MongoDB to work
   - Start MongoDB service

## Quick Commands

### Start Backend:
```bash
cd HHD-APP-Backend
npm run dev
```

### Check Backend Health:
```bash
curl http://localhost:5000/health
```

### Test Send OTP:
```bash
# PowerShell
$body = @{mobile='9876543210'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/send-otp' -Method Post -Body $body -ContentType 'application/json'
```

## Need Help?

Check the console logs - they now show:
- The exact URL being used
- Request data
- Response status
- Detailed error messages

This will help identify the exact issue!
