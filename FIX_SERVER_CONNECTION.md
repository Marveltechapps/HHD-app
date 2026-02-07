# 🔧 Server Connection Fix - Quick Start

## ✅ Your Current Configuration

- **IP Address:** `YOUR_IP` (your PC IPv4) ✅
- **Port:** `5000` ✅
- **app.json:** Set `expo.extra.apiUrl` ✅
- **API URL:** `http://YOUR_IP:5000/api` ✅

## 🚀 Quick Fix (Choose One Method)

### Method 1: Automated Fix (Recommended)

```powershell
# Run the quick fix script
.\quick-fix-server-connection.ps1
```

This will:
- ✅ Check your IP address
- ✅ Verify app.json configuration
- ✅ Check if backend is running
- ✅ Test firewall settings
- ✅ Test connection

### Method 2: Manual Fix

#### Step 1: Fix Windows Firewall ⚠️ **MOST IMPORTANT**

**Run as Administrator:**
```powershell
.\fix-firewall.ps1
```

This allows Node.js and port 5000 through Windows Firewall.

#### Step 2: Start Backend Server

```powershell
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000
✅ MongoDB connected successfully
```

#### Step 3: Test Connection

```powershell
# From your computer
.\test-connection.ps1

# Or manually
curl http://YOUR_IP:5000/health
```

**From your phone browser:**
- Go to: `http://YOUR_IP:5000/health`
- Should see: `{"status":"OK",...}`

## 🔍 Troubleshooting

### If connection still fails:

1. **Verify backend is running:**
   ```powershell
   cd HHD-APP-Backend
   npm run dev
   ```

2. **Check Windows Firewall:**
   - Run `.\fix-firewall.ps1` as Administrator
   - Or manually allow Node.js and port 5000

3. **Verify same network:**
   - Phone and computer must be on same WiFi
   - Check phone WiFi IP (should be like `192.168.1.XXX`)

4. **Test from phone browser:**
   - If `http://YOUR_IP:5000/health` works → Backend is accessible
   - If it doesn't work → Firewall is blocking

5. **Restart everything:**
   - Stop backend (Ctrl+C)
   - Restart backend: `npm run dev`
   - Reload app on device

## 📋 Files Created

1. **`fix-firewall.ps1`** - Configures Windows Firewall (run as Admin)
2. **`test-connection.ps1`** - Tests server connection
3. **`quick-fix-server-connection.ps1`** - Automated fix script
4. **`docs/SERVER_CONNECTION_FIX.md`** - Detailed guide

## ✅ Success Indicators

After fixing, you should see:

1. ✅ Backend starts without errors
2. ✅ Connection test passes
3. ✅ Health endpoint works from phone browser
4. ✅ App connects successfully
5. ✅ OTP requests work

## 🆘 Still Not Working?

1. Check backend logs for errors
2. Temporarily disable Windows Firewall to test
3. Try mobile hotspot instead of WiFi
4. Verify MongoDB is running (if using local MongoDB)
5. Check router settings (some routers block device-to-device)

---

**Most Common Issue:** Windows Firewall blocking port 5000
**Solution:** Run `.\fix-firewall.ps1` as Administrator
