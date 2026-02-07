# 🔧 Server Connection Fix Guide

## Problem
Server is not connecting even though:
- ✅ IP address is configured correctly
- ✅ Both devices are on the same network

## Quick Fix (3 Steps)

### Step 1: Configure Windows Firewall ⚠️ **REQUIRED**

**Run as Administrator:**
```powershell
# Navigate to project root
cd <PROJECT_ROOT>

# Run firewall fix script
.\fix-firewall.ps1
```

**Or manually:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" → "Allow another app"
4. Browse to Node.js (usually `C:\Program Files\nodejs\node.exe`)
5. Check both "Private" and "Public" networks
6. Add a rule for Port 5000 (TCP) - Inbound

### Step 2: Verify Backend Server is Running

```powershell
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000 in development mode
📱 Android Emulator: http://10.0.2.2:5000/api
🌐 Local Access: http://localhost:5000/api
💻 Network Access: http://YOUR_IP:5000/api
📱 Physical Device: Use http://YOUR_IP:5000/api in app.json
✅ MongoDB connected successfully
```

### Step 3: Test Connection

**From your computer:**
```powershell
# Run connection test
.\test-connection.ps1
```

**Or manually test:**
```powershell
# Test health endpoint
curl http://YOUR_IP:5000/health

# Should return: {"status":"OK",...}
```

**From your phone browser:**
1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000/health`
3. Should see: `{"status":"OK",...}`

## Verify Configuration

### Check app.json
Your `app.json` should have:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:5000/api"
    }
  }
}
```

### Check Your IP Address
```powershell
ipconfig | findstr IPv4
```

**Current IP:** `YOUR_IP` ✅

If your IP changes, update `app.json`:
```json
"apiUrl": "http://YOUR_NEW_IP:5000/api"
```

## Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Symptoms:**
- App shows "Cannot connect to server"
- Connection test fails

**Solutions:**
1. ✅ **Run firewall fix script** (Step 1 above)
2. ✅ **Verify backend is running** (Step 2 above)
3. ✅ **Check both devices on same WiFi**
4. ✅ **Restart backend server** after firewall changes

### Issue 2: "Request timeout"

**Symptoms:**
- Requests hang and timeout
- No response from server

**Solutions:**
1. Check if MongoDB is running:
   ```powershell
   # Windows - Check Services
   # Press Win+R → services.msc → Find "MongoDB"
   ```
2. Check backend logs for errors
3. Verify port 5000 is not used by another app:
   ```powershell
   netstat -ano | findstr :5000
   ```

### Issue 3: "Network request failed"

**Symptoms:**
- Immediate failure
- No connection attempt

**Solutions:**
1. ✅ **Verify IP address in app.json matches your computer IP**
2. ✅ **Check Windows Firewall** (Step 1)
3. ✅ **Ensure backend is running** (Step 2)
4. ✅ **Test from phone browser first** (Step 3)

### Issue 4: IP Address Changed

**If your computer gets a new IP:**

1. Find new IP:
   ```powershell
   ipconfig | findstr IPv4
   ```

2. Update `app.json`:
   ```json
   "apiUrl": "http://NEW_IP:5000/api"
   ```

3. Restart Expo:
   ```powershell
   # Stop Expo (Ctrl+C)
   npm start
   ```

4. Reload app on device

## Platform-Specific URLs

| Platform | URL | Status |
|----------|-----|--------|
| **Physical Android** | `http://YOUR_IP:5000/api` | ✅ Configure in `app.json` |
| **Physical iOS** | `http://YOUR_IP:5000/api` | ✅ Configure in `app.json` |
| **Android Emulator** | `http://10.0.2.2:5000/api` | ✅ Auto-detected |
| **iOS Simulator** | `http://localhost:5000/api` | ✅ Auto-detected |
| **Web** | `http://localhost:5000/api` | ✅ Auto-detected |

## Verification Checklist

Before reporting issues, verify:

- [ ] Backend server is running (`npm run dev` in HHD-APP-Backend)
- [ ] Windows Firewall allows Node.js and port 5000
- [ ] MongoDB is running (if using local MongoDB)
- [ ] IP address in `app.json` matches your computer IP
- [ ] Both devices are on the same WiFi network
- [ ] Connection test passes (`.\test-connection.ps1`)
- [ ] Health endpoint works from phone browser

## Still Not Working?

1. **Check backend logs** for errors
2. **Check Windows Firewall** - temporarily disable to test
3. **Try different network** - mobile hotspot
4. **Check router settings** - some routers block device-to-device communication
5. **Verify MongoDB connection** - backend won't start if MongoDB fails

## Quick Commands Reference

```powershell
# Find your IP
ipconfig | findstr IPv4

# Fix firewall (as Administrator)
.\fix-firewall.ps1

# Test connection
.\test-connection.ps1

# Start backend
cd HHD-APP-Backend
npm run dev

# Check if port is in use
netstat -ano | findstr :5000
```

## Expected Behavior

After fixing:

1. ✅ Backend starts without errors
2. ✅ Connection test passes
3. ✅ Health endpoint accessible from phone
4. ✅ App connects successfully
5. ✅ OTP requests work

---

**Last Updated:** Replace `YOUR_IP` with your PC IPv4
**If IP changes, update this document and `app.json`**
