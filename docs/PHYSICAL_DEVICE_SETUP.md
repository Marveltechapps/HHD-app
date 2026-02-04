# Physical Device Setup Guide

## ✅ Configuration Complete

Your app is now configured to work with physical devices using your computer's IP address: **192.168.1.49:5000**

## 📋 What Was Fixed

1. **API Configuration** - Now reads from `app.json` → `extra.apiUrl`
2. **Environment Variables** - Supports `EXPO_PUBLIC_API_URL` in `.env` file
3. **Fetch Timeout** - Added 30-second timeout to all API requests
4. **Error Handling** - Improved error messages with troubleshooting steps
5. **Platform Detection** - Properly handles physical devices vs emulators

## 🚀 Quick Start

### Step 1: Verify Backend is Running

```bash
cd HHD-APP-Backend
npm run dev
```

You should see:
```
🚀 Server running on http://0.0.0.0:5000
✅ MongoDB connected
```

### Step 2: Test Backend from Your Phone

1. **Open browser on your phone**
2. **Go to**: `http://192.168.1.49:5000/health`
3. **Should see**: `{"status":"OK",...}`

If this doesn't work, check Windows Firewall.

### Step 3: Restart Expo

```bash
# Stop current Expo (Ctrl+C)
npm start
```

### Step 4: Reload App on Device

- **Expo Go**: Shake device → Reload
- **Or**: Press `r` in Expo terminal

### Step 5: Check Console

You should see:
```
[API Config] ✅ Using app.json config (extra.apiUrl): http://192.168.1.49:5000/api
[API] POST Request to: http://192.168.1.49:5000/api/auth/send-otp
```

## 🔧 Configuration Methods

### Method 1: app.json (Current - Already Set)

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.49:5000/api"
    }
  }
}
```

✅ **Already configured!** No changes needed.

### Method 2: Environment Variable (Alternative)

Create `.env` file in project root:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.49:5000/api
```

Then restart Expo.

### Method 3: Find Your IP Automatically

If your IP changes, find it with:
```bash
# Windows
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Then update `app.json` or `.env` file.

## 🔍 Troubleshooting

### Issue: Still Getting Network Error

1. **Check Backend is Running**
   ```bash
   curl http://192.168.1.49:5000/health
   ```

2. **Check Windows Firewall**
   - Allow Node.js through firewall
   - Or temporarily disable for testing

3. **Verify Same Network**
   - Phone and computer must be on same WiFi
   - Check phone WiFi IP (should be like `192.168.1.XXX`)

4. **Check Console Logs**
   - Look for `[API Config]` message
   - Should show: `http://192.168.1.49:5000/api`

5. **Test from Phone Browser**
   - Go to: `http://192.168.1.49:5000/health`
   - If this works, backend is accessible
   - If not, firewall is blocking

### Issue: IP Address Changed

If your computer gets a new IP:
1. Find new IP: `ipconfig | findstr IPv4`
2. Update `app.json` → `extra.apiUrl`
3. Restart Expo

### Issue: Timeout Errors

- Check network connection
- Verify backend is running
- Check if firewall is blocking
- Try increasing timeout in `api.service.ts` (default: 30 seconds)

## 📱 Platform-Specific URLs

| Platform | URL | Status |
|----------|-----|--------|
| **Physical Android** | `http://192.168.1.49:5000/api` | ✅ Configured |
| **Physical iOS** | `http://192.168.1.49:5000/api` | ✅ Configured |
| **Android Emulator** | `http://10.0.2.2:5000/api` | ✅ Auto-detected |
| **iOS Simulator** | `http://localhost:5000/api` | ✅ Auto-detected |
| **Web** | `http://localhost:5000/api` | ✅ Auto-detected |

## ✅ Best Practices

1. **Use Environment Variables** - For different environments (dev/staging/prod)
2. **Keep IP Updated** - If IP changes, update config
3. **Test Connection First** - Use phone browser to test backend accessibility
4. **Check Firewall** - Ensure Node.js is allowed through firewall
5. **Same Network** - Always ensure phone and computer on same WiFi

## 🎯 Expected Behavior

After setup:
1. ✅ Console shows: `[API Config] ✅ Using app.json config`
2. ✅ API requests go to: `http://192.168.1.49:5000/api`
3. ✅ OTP requests succeed
4. ✅ Backend receives requests
5. ✅ OTP generated and returned

## 📝 Notes

- **Backend must bind to `0.0.0.0`** (already configured in `server.ts`)
- **Fetch uses native React Native fetch** (no Axios needed)
- **30-second timeout** on all requests
- **Automatic platform detection** with manual override support
