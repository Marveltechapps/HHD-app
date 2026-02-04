# 🔧 Fix Network Error - Step by Step

## ✅ What I Fixed

1. **Updated API Config** - Now supports environment variables and app.json config
2. **Updated app.json** - Added your computer IP (`192.168.1.49:5000/api`)
3. **Enhanced Logging** - Better error messages and platform detection

## 🚀 Quick Fix (3 Steps)

### Step 1: Restart Expo
```bash
# Stop current Expo (Ctrl+C)
# Then restart:
npm start
```

### Step 2: Reload Your App
- **Web**: Refresh browser (F5)
- **Mobile**: Shake device → Reload, or press `r` in Expo terminal

### Step 3: Check Console
You should now see:
```
[API Config] ✅ Using app.json config: http://192.168.1.49:5000/api
[API] POST Request to: http://192.168.1.49:5000/api/auth/send-otp
```

## ✅ Verify Backend is Running

```bash
cd HHD-APP-Backend
npm run dev
```

Should see:
```
🚀 Server running on http://0.0.0.0:5000
✅ MongoDB connected
```

## 🔍 Test Connection

1. **From your computer:**
   ```bash
   curl http://192.168.1.49:5000/health
   ```
   Should return: `{"status":"OK",...}`

2. **From your phone browser:**
   - Open browser on phone
   - Go to: `http://192.168.1.49:5000/health`
   - Should see: `{"status":"OK",...}`

## ⚠️ If Still Not Working

### Check Windows Firewall
1. Open Windows Defender Firewall
2. Allow Node.js through firewall
3. Or temporarily disable for testing

### Verify Both Devices on Same Network
- Phone and computer must be on same WiFi
- Check phone WiFi IP (should be like `192.168.1.XXX`)

### Check Backend Logs
When you click "Send OTP", backend should show:
```
POST /api/auth/send-otp
OTP generated for mobile: 9344673962
```

## 📱 Your Configuration

- **Computer IP**: `192.168.1.49`
- **Backend Port**: `5000`
- **API URL**: `http://192.168.1.49:5000/api`
- **Configured in**: `app.json` → `extra.apiUrl`

## 🎯 Expected Result

After fix:
1. ✅ Console shows correct IP
2. ✅ OTP request succeeds
3. ✅ Backend receives request
4. ✅ OTP generated and returned
5. ✅ Alert shows OTP (dev mode)
