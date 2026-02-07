# 🔧 Solve All Connection Errors - Step by Step

## Current Error
```
ERROR [API] POST Error: [TypeError: Network request failed]
ERROR [Auth Service] Send OTP Error: Cannot connect to backend server at http://YOUR_IP:5000/api
```

## ✅ Quick Fix (3 Steps)

### Step 1: Fix Windows Firewall ⚠️ **REQUIRED**

**Option A: Run Batch File (Easier)**
1. Right-click `fix-firewall.bat`
2. Select "Run as Administrator"
3. Follow the prompts

**Option B: Manual Fix**
1. Press `Win + R`, type `wf.msc`, press Enter
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Select "TCP", enter port `5000` → Next
5. Select "Allow the connection" → Next
6. Check all (Domain, Private, Public) → Next
7. Name: "HHD App Backend Port 5000" → Finish

**Option C: PowerShell (If you have admin PowerShell open)**
```powershell
.\fix-firewall.ps1
```

### Step 2: Verify Backend is Running

```powershell
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000
💻 Network Access: http://YOUR_IP:5000/api
✅ MongoDB connected successfully
```

### Step 3: Test Connection

**From your phone browser:**
1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000/health`
3. Should see: `{"status":"OK",...}`

**If this works → Backend is accessible!**
**If this doesn't work → Firewall is still blocking**

## 🔍 Verify Configuration

### Check app.json
Your `app.json` is correctly configured:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_IP:5000/api"
    },
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

✅ **IP Address:** `YOUR_IP` (your PC IPv4)
✅ **Port:** `5000` (correct)
✅ **Cleartext Traffic:** Enabled for Android

## 🐛 Common Issues & Solutions

### Issue 1: "Network request failed" - Still Getting Error

**Cause:** Windows Firewall blocking incoming connections

**Solution:**
1. ✅ Run `fix-firewall.bat` as Administrator
2. ✅ Restart backend server after firewall fix
3. ✅ Test from phone browser first

### Issue 2: Backend Not Accessible from Phone

**Check:**
1. Both devices on same WiFi network?
2. Windows Firewall allows port 5000?
3. Backend server is running?

**Test:**
```powershell
# From your computer
curl http://YOUR_IP:5000/health

# Should return: {"status":"OK",...}
```

### Issue 3: App Still Shows Error After Fix

**Solution:**
1. **Restart Expo:**
   ```powershell
   # Stop Expo (Ctrl+C)
   npm start
   ```

2. **Reload App:**
   - Shake device → Reload
   - Or press `r` in Expo terminal

3. **Check Console:**
   - Should see: `[API Config] ✅ Using app.json config (extra.apiUrl): http://YOUR_IP:5000/api`

## 📋 Verification Checklist

Before testing the app, verify:

- [ ] ✅ Backend server is running (`npm run dev` in HHD-APP-Backend)
- [ ] ✅ Windows Firewall allows port 5000 (run `fix-firewall.bat` as Admin)
- [ ] ✅ Health endpoint works from phone browser: `http://YOUR_IP:5000/health`
- [ ] ✅ IP address in `app.json` matches your computer IP (`YOUR_IP`)
- [ ] ✅ Both devices are on the same WiFi network
- [ ] ✅ MongoDB is running (if using local MongoDB)

## 🚀 After Fixing

1. **Restart Backend** (if you fixed firewall while it was running)
2. **Restart Expo** (stop and start again)
3. **Reload App** on device
4. **Try Sending OTP** again

## ✅ Expected Result

After fixing, you should see:

1. ✅ Backend starts without errors
2. ✅ Health endpoint accessible from phone browser
3. ✅ App console shows: `[API Config] ✅ Using app.json config`
4. ✅ OTP request succeeds
5. ✅ No "Network request failed" errors

## 🆘 Still Not Working?

1. **Check Backend Logs:**
   - Look for connection attempts
   - Check for CORS errors
   - Verify MongoDB connection

2. **Temporarily Disable Firewall:**
   - Only for testing!
   - If this works, firewall is the issue

3. **Try Different Network:**
   - Use mobile hotspot
   - Some routers block device-to-device communication

4. **Check Router Settings:**
   - Some routers have "AP Isolation" enabled
   - This prevents devices from talking to each other

---

## 📝 Files Created/Updated

1. ✅ `app.json` - Added `usesCleartextTraffic: true` for Android
2. ✅ `fix-firewall.bat` - Easy firewall fix (run as Admin)
3. ✅ `fix-firewall.ps1` - PowerShell firewall fix
4. ✅ `test-connection.ps1` - Connection test utility
5. ✅ `HHD-APP-Backend/src/server.ts` - Enhanced logging

---

**Most Common Issue:** Windows Firewall blocking port 5000
**Solution:** Run `fix-firewall.bat` as Administrator
