# Fix: Network Request Failed Error

## Quick Fix Steps

### 1. ✅ Ensure Backend Server is Running

**Start the backend server:**
```bash
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000 in development mode
📱 Android Emulator: http://10.0.2.2:5000/api
🌐 Local Access: http://localhost:5000/api
✅ MongoDB connected
```

### 2. ✅ Test Backend Connection

**Open a new terminal and test:**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Or use the test script
cd HHD-APP-Backend
node test-connection.js
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": ...
}
```

### 3. ✅ Verify Platform Configuration

The app automatically detects your platform:
- **Android Emulator**: Uses `http://10.0.2.2:5000/api` ✅
- **iOS Simulator**: Uses `http://localhost:5000/api` ✅
- **Physical Device**: Needs your computer's IP address

**Check console logs** - you should see:
```
[API Config] Android detected - Using: http://10.0.2.2:5000/api
[API] POST Request to: http://10.0.2.2:5000/api/auth/send-otp
```

### 4. ✅ Check Windows Firewall

**Allow Node.js through firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature"
3. Find "Node.js" and enable both Private and Public
4. If not found, click "Allow another app" → Browse → Select Node.js

**Or temporarily disable firewall for testing:**
- Only for development/testing purposes

### 5. ✅ Verify MongoDB is Running

**Check MongoDB service:**
```bash
# Windows - Check Services
# Press Win+R → services.msc → Find "MongoDB"

# Or test connection
mongosh
```

**If MongoDB is not running:**
- Start MongoDB service
- Or update `.env` to use MongoDB Atlas (cloud)

### 6. ✅ Check Backend Server Binding

The server now binds to `0.0.0.0` (all interfaces) by default, which allows:
- ✅ Localhost access
- ✅ Android emulator access (10.0.2.2)
- ✅ Network access (for physical devices)

**Verify in server logs:**
```
🚀 Server running on http://0.0.0.0:5000
```

## Common Issues & Solutions

### Issue: "Cannot connect to backend server"

**Solution:**
1. ✅ Backend is running (`npm run dev` in HHD-APP-Backend)
2. ✅ Server shows "Server running on http://0.0.0.0:5000"
3. ✅ MongoDB is connected
4. ✅ Firewall allows Node.js
5. ✅ Test `curl http://localhost:5000/health` works

### Issue: "Network request failed" on Android Emulator

**Solution:**
1. ✅ Backend must be running on host machine
2. ✅ Use `http://10.0.2.2:5000/api` (already configured)
3. ✅ Check Windows Firewall settings
4. ✅ Verify backend logs show incoming requests

### Issue: Works on localhost but not emulator

**Solution:**
- Server now binds to `0.0.0.0` (all interfaces)
- Restart backend after the fix
- Check firewall allows incoming connections on port 5000

## Testing Checklist

- [ ] Backend server is running (`npm run dev`)
- [ ] Server logs show "Server running on http://0.0.0.0:5000"
- [ ] MongoDB is connected (check server logs)
- [ ] `curl http://localhost:5000/health` returns OK
- [ ] Windows Firewall allows Node.js
- [ ] App console shows correct API URL
- [ ] Network request reaches backend (check server logs)

## Still Having Issues?

1. **Check backend terminal** - Are there any errors?
2. **Check app console** - What URL is being used?
3. **Test with curl** - Does `curl http://localhost:5000/health` work?
4. **Check firewall** - Is port 5000 blocked?
5. **Restart everything** - Backend server, emulator, and app

## Quick Commands

```bash
# Start backend
cd HHD-APP-Backend && npm run dev

# Test connection
cd HHD-APP-Backend && node test-connection.js

# Check if port is in use (Windows)
netstat -ano | findstr :5000

# Check MongoDB
mongosh
```
