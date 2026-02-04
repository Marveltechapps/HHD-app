# Quick Fix for Physical Android Device

## Problem
App is trying to connect to `http://10.0.2.2:5000/api` but failing.

## Solution

### Option 1: Set Environment Variable (Recommended)

Create or edit `.env` file in project root:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.49:5000/api
```

Then restart Expo:
```bash
npm start
```

### Option 2: Update app.json

Add to `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://192.168.1.49:5000/api"
    }
  }
}
```

### Option 3: Temporarily Hardcode (Quick Test)

Edit `src/config/api.ts` and replace the Android section:

```typescript
if (platform === 'android') {
  // For physical device, use your computer's IP
  const url = 'http://192.168.1.49:5000/api';
  console.log('[API Config] Android physical device - Using:', url);
  return url;
}
```

## Verify Backend is Accessible

1. **Check backend is running:**
   ```bash
   cd HHD-APP-Backend
   npm run dev
   ```

2. **Test from your computer:**
   ```bash
   curl http://192.168.1.49:5000/health
   ```

3. **Test from your phone browser:**
   - Open browser on phone
   - Go to: `http://192.168.1.49:5000/health`
   - Should see: `{"status":"OK",...}`

4. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Or temporarily disable for testing

## Your Current Setup

- **Computer IP**: `192.168.1.49`
- **Backend Port**: `5000`
- **API URL for Physical Device**: `http://192.168.1.49:5000/api`

## After Fix

1. Restart Expo: `npm start`
2. Reload app on device
3. Try sending OTP again
4. Check console for: `[API Config] Using: http://192.168.1.49:5000/api`
