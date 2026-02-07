# ⚡ QUICK FIX - Do This Now!

## The Problem
Your app shows: `Network request failed` when trying to connect to `http://YOUR_IP:5000/api`

## The Solution (2 Minutes)

### Step 1: Fix Windows Firewall (30 seconds)

**Right-click this file and select "Run as Administrator":**
```
fix-firewall.bat
```

**OR manually:**
1. Press `Win + R`
2. Type: `wf.msc` and press Enter
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP", enter `5000` → Next
6. Select "Allow the connection" → Next
7. Check all boxes → Next
8. Name: "HHD App Port 5000" → Finish

### Step 2: Verify Backend is Running (30 seconds)

Open a new terminal and run:
```powershell
cd HHD-APP-Backend
npm run dev
```

**You should see:**
```
🚀 Server running on http://0.0.0.0:5000
✅ MongoDB connected successfully
```

### Step 3: Test from Phone (30 seconds)

1. Open browser on your phone
2. Go to: `http://YOUR_IP:5000/health`
3. Should see: `{"status":"OK",...}`

**If this works → You're done! Reload your app.**

**If this doesn't work → Firewall is still blocking. Try disabling firewall temporarily to test.**

### Step 4: Reload App (30 seconds)

1. Stop Expo (Ctrl+C in terminal)
2. Restart: `npm start`
3. Reload app on device (shake → Reload)

## ✅ Done!

Your app should now connect successfully.

---

**Still not working?** See `SOLVE_CONNECTION_ERRORS.md` for detailed troubleshooting.
