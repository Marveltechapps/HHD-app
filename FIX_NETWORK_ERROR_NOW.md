# 🔧 FIX NETWORK ERROR - Step by Step

## Current Error
```
Network request failed
Cannot connect to backend server
```

## ✅ Your Configuration is Correct!

- ✅ IP Address: `YOUR_IP` (your PC IPv4)
- ✅ Port: `5000`
- ✅ app.json: Set `expo.extra.apiUrl`
- ✅ Android Cleartext: Enabled
- ✅ Backend Server: Running

## 🚨 The Problem: Windows Firewall

**Windows Firewall is blocking incoming connections on port 5000.**

## 🔧 Solution (Do These Steps in Order)

### Step 1: Fix Windows Firewall ⚠️ **REQUIRED**

**Option A: Use Batch File (Easiest)**
1. Right-click `fix-firewall.bat`
2. Select **"Run as Administrator"**
3. Wait for it to complete

**Option B: Manual Fix**
1. Press `Win + R`
2. Type: `wf.msc` and press Enter
3. Click **"Inbound Rules"** → **"New Rule"**
4. Select **"Port"** → Next
5. Select **"TCP"**, enter port `5000` → Next
6. Select **"Allow the connection"** → Next
7. Check all boxes (Domain, Private, Public) → Next
8. Name: **"HHD App Backend Port 5000"** → Finish

**Option C: PowerShell (If you have admin PowerShell)**
```powershell
.\fix-firewall.ps1
```

### Step 2: Verify Backend is Running

Open a terminal and check:
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

### Step 3: Test from Phone Browser

**This is the most important test!**

1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000/health`
3. Should see: `{"status":"OK",...}`

**✅ If this works → Backend is accessible!**
**❌ If this doesn't work → Firewall is still blocking**

### Step 4: Restart Everything

1. **Stop Expo** (Ctrl+C in terminal)
2. **Restart Expo:**
   ```powershell
   npm start
   ```
3. **Clear Expo cache** (if needed):
   ```powershell
   npm start -- --clear
   ```
4. **Reload app on device:**
   - Shake device → Reload
   - Or press `r` in Expo terminal

### Step 5: Check Console Logs

In your app console, you should see:
```
[API Config] ✅ Using app.json config (extra.apiUrl): http://YOUR_IP:5000/api
[API] POST Request to: http://YOUR_IP:5000/api/auth/send-otp
```

**If you see `10.0.2.2` instead → app.json config is not being read!**

## 🔍 Troubleshooting

### Issue 1: Still Getting "Network request failed"

**Check:**
1. ✅ Did you run `fix-firewall.bat` as Administrator?
2. ✅ Can you access `http://YOUR_IP:5000/health` from phone browser?
3. ✅ Did you restart Expo after fixing firewall?

**If phone browser test fails:**
- Firewall is still blocking
- Try temporarily disabling firewall to test
- Check router settings (some routers block device-to-device)

### Issue 2: App Shows Wrong URL (10.0.2.2)

**This means app.json config is not being read.**

**Fix:**
1. Stop Expo (Ctrl+C)
2. Clear cache: `npm start -- --clear`
3. Restart: `npm start`
4. Reload app

### Issue 3: Backend Not Running

**Start backend:**
```powershell
cd HHD-APP-Backend
npm run dev
```

**Check MongoDB:**
- If MongoDB error, start MongoDB service
- Or use MongoDB Atlas (cloud)

## ✅ Verification Checklist

Before testing, verify:

- [ ] ✅ Windows Firewall allows port 5000 (run `fix-firewall.bat` as Admin)
- [ ] ✅ Backend server is running (`npm run dev` in HHD-APP-Backend)
- [ ] ✅ Health endpoint works from phone: `http://YOUR_IP:5000/health`
- [ ] ✅ Both devices on same WiFi network
- [ ] ✅ Expo restarted after firewall fix
- [ ] ✅ App reloaded on device

## 🎯 Expected Result

After fixing:

1. ✅ Phone browser can access `http://YOUR_IP:5000/health`
2. ✅ App console shows: `[API Config] ✅ Using app.json config`
3. ✅ OTP request succeeds
4. ✅ No "Network request failed" errors

## 🆘 Still Not Working?

1. **Temporarily disable Windows Firewall** (for testing only!)
   - If this works → Firewall is the issue
   - Re-enable firewall and use `fix-firewall.bat`

2. **Try mobile hotspot:**
   - Connect phone to computer's mobile hotspot
   - Some routers block device-to-device communication

3. **Check router settings:**
   - Look for "AP Isolation" or "Client Isolation"
   - Disable it if enabled

4. **Verify IP address:**
   ```powershell
   ipconfig | findstr IPv4
   ```
   - If IP changed, update `app.json`

---

## 📝 Quick Commands

```powershell
# Fix firewall (as Administrator)
.\fix-firewall.bat

# Check API config
node check-api-config.js

# Test connection
.\test-connection.ps1

# Start backend
cd HHD-APP-Backend
npm run dev

# Restart Expo with cache clear
npm start -- --clear
```

---

**Most Common Issue:** Windows Firewall blocking port 5000
**Solution:** Run `fix-firewall.bat` as Administrator
