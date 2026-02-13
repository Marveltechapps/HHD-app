# HHD App

Monorepo for the HHD (Hand-Held Device) warehouse order picking app: **frontend** (Expo/React Native) and **backend** (Node/Express API), with a single Git repository at the root.

## Structure

```
HHD-app/
├── frontend/     # Expo / React Native mobile app
├── backend/      # Node.js API server
└── README.md     # This file
```

## Quick start

### Backend

From the **project root**:

```bash
cd backend && npm install && npm run dev
```

Server runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm start
```

Then use Expo Go or run `npm run android` / `npm run ios`.

## Docs

- **Frontend:** [frontend/README.md](frontend/README.md) — app setup, run, and build
- **Backend:** [backend/README.md](backend/README.md) — API setup and scripts

## Production

When deploying: exclude dev-only files (docs, scripts, test config, `.env` templates). Backend: use `dist/` and `npm ci --omit=dev`. Frontend: ship built artifact (APK/web). Use platform env for secrets.

## Single Git repo

All changes (frontend and backend) are tracked in this one repository. Commit and push from the root; do not create separate Git repos inside `frontend/` or `backend/`.
