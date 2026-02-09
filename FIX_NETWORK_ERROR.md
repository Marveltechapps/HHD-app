# 🔧 Fix Network Error - Step by Step Guide

## ✅ Configuration Updated!

Your API URL has been configured:
- **Your IP Address**: `192.168.1.8`
- **API URL**: `http://192.168.1.8:5000/api`
- **app.json**: ✅ Updated
- **.env file**: ✅ Created

## 🚀 Quick Fix (3 Steps)

### Step 1: Fix Windows Firewall ⚠️ **REQUIRED**

**Option A: Run PowerShell Script (Easiest)**
1. Right-click `fix-firewall.ps1`
2. Select **"Run as Administrator"**
3. Wait for completion

**Option B: Manual Fix**
1. Press `Win + R`, type `wf.msc`, press Enter
2. Click **"Inbound Rules"** → **"New Rule"**
3. Select **"Port"** → Next
4. Select **"TCP"**, enter port `5000` → Next
5. Select **"Allow the connection"** → Next
6. Check all boxes (Domain, Private, Public) → Next
7. Name: **"HHD App Backend Port 5000"** → Finish

### Step 2: Start Backend Server

Open a **new terminal window** and run:

```powershell
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000
💻 Network Access: http://192.168.1.8:5000/api
✅ MongoDB connected successfully
```

**If MongoDB is not running:**
- Windows: Start MongoDB service from Services
- Or run: `mongod` in a separate terminal

### Step 3: Restart Expo and Test

**In your main terminal (where Expo is running):**

1. **Stop Expo** (Press `Ctrl + C`)

2. **Clear cache and restart:**
   ```powershell
   npm start -- --clear
   ```

3. **Reload app on device:**
   - Shake device → Reload
   - Or press `r` in terminal

4. **Test connection:**
   - Enter mobile number
   - Click "SEND OTP"
   - Check console for success

## 🔍 Verify Connection

### Test from Phone Browser:
1. Open browser on your phone
2. Go to: `http://192.168.1.8:5000/health`
3. Should see: `{"status":"OK",...}`

**✅ If this works → Backend is accessible!**
**❌ If this doesn't work → Firewall is still blocking**

### Check Console Logs:
Look for these messages in Expo console:
```
[API Config] ✅ Using environment variable (EXPO_PUBLIC_API_URL): http://192.168.1.8:5000/api
[API] POST Request: http://192.168.1.8:5000/api/auth/send-otp
```

## 🐛 Troubleshooting

### Issue 1: "Network request failed" - Still Getting Error

**Cause:** Windows Firewall blocking incoming connections

**Solution:**
1. ✅ Run `fix-firewall.ps1` as Administrator
2. ✅ Verify backend is running: `cd HHD-APP-Backend && npm run dev`
3. ✅ Test from phone browser: `http://192.168.1.8:5000/health`

### Issue 2: Backend Won't Start

**Check MongoDB:**
```powershell
# Check if MongoDB is running
Get-Service | Where-Object {$_.Name -like "*mongo*"}
```

**Start MongoDB:**
- Open Services (Win + R → `services.msc`)
- Find "MongoDB" service
- Right-click → Start

### Issue 3: Wrong IP Address

If your IP address changes (different WiFi network):

1. **Find new IP:**
   ```powershell
   ipconfig | findstr IPv4
   ```

2. **Update configuration:**
   - Edit `.env` file: `EXPO_PUBLIC_API_URL=http://NEW_IP:5000/api`
   - Or edit `app.json`: `"apiUrl": "http://NEW_IP:5000/api"`

3. **Restart Expo:**
   ```powershell
   npm start -- --clear
   ```

## 📋 Checklist

- [ ] Windows Firewall rule added (port 5000)
- [ ] Backend server running (`cd HHD-APP-Backend && npm run dev`)
- [ ] MongoDB running
- [ ] Can access `http://192.168.1.8:5000/health` from phone browser
- [ ] Expo restarted with `--clear` flag
- [ ] App reloaded on device
- [ ] OTP request succeeds

## 🎯 Your Current Configuration

- **IP Address**: `192.168.1.8`
- **Backend Port**: `5000`
- **API URL**: `http://192.168.1.8:5000/api`
- **Platform**: Android (uses app.json config)
- **Cleartext Traffic**: Enabled ✅

## 💡 Quick Commands

```powershell
# Find your IP
ipconfig | findstr IPv4

# Start backend
cd HHD-APP-Backend && npm run dev

# Restart Expo
npm start -- --clear

# Test backend
curl http://192.168.1.8:5000/health
```

---

**Still having issues?** Check the console logs for `[API]` messages to see what URL is being used.
