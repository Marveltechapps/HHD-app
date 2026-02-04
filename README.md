# HHD App

A React Native (Expo) mobile app for warehouse order picking and fulfillment. Built for hand-held device workflows in quick commerce and last-mile delivery operations.

## Features

- **Auth flow** — OTP-based login with mobile number
- **Order picking** — End-to-end flow: order received → bag scan → item pick → completion
- **Bag & item scanning** — QR/barcode scan for bags and rack locations
- **Photo verification** — Capture photo of items inside bag before handoff
- **Rack handoff** — Scan rack QR for rider assignment
- **Tasks & profile** — Task list and user profile with sign-out

## Tech Stack

| Layer       | Stack                          |
| ----------- | ------------------------------ |
| Framework   | React Native 0.81 + Expo 54     |
| Language   | TypeScript 5.9                 |
| UI         | React Native core + `react-native-svg` |
| Design     | Custom tokens (spacing, colors, typography) |

## Prerequisites

- **Node.js** 18+ (LTS preferred)
- **npm** or **yarn**
- **Expo Go** on device (or Android/iOS simulator)

## Installation

```bash
# Clone and enter project
git clone https://github.com/Marveltechapps/HHD-app.git
cd HHD-app

# Install dependencies
npm install
```

## Running the App

```bash
# Start Expo dev server
npm start

# Run on specific platform
npm run android   # Android device/emulator
npm run ios       # iOS simulator (macOS only)
npm run web       # Web browser
```

Scan the QR code with Expo Go (Android) or Camera (iOS) to open on device.

## Project Structure

```
hhd-app/
├── App.tsx                 # Root navigation & screen routing
├── index.ts                # Entry point
├── app.json                # Expo config
├── src/
│   ├── components/         # Screens & shared UI
│   │   ├── design-system/  # Card, Button, TextField
│   │   └── icons/          # SVG-based icons
│   ├── services/           # API service layer
│   ├── contexts/           # React contexts (Auth)
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── design-system/
│       └── tokens.ts       # Spacing, colors, typography, radius
├── HHD-APP-Backend/        # Backend API server
│   ├── src/
│   │   ├── api/            # Routes & controllers
│   │   ├── models/         # MongoDB models
│   │   ├── services/       # Business logic
│   │   └── middleware/    # Express middleware
│   └── scripts/             # Database seeding scripts
├── assets/                 # Images, logos, splash
├── docs/                   # Documentation & guides
└── temp_icons/             # Icon source assets
```

## App Flow

1. **Splash** → **Device ready** → **Terms** → **Login** (mobile) → **OTP**
2. **Home** — Order received, Tasks, Profile
3. **Order received** → **Bag scan** → **Order overview** → **Active pick session**
4. **Order completion** → **Photo inside bag** → **Scan rack QR** → **Order complete**
5. Back to **Home** or **Tasks** / **Profile**

## Design System

- **8pt grid** — `spacing` (xxs → 4xl)
- **Colors** — `primary`, `success`, `error`, `warning`, category & priority palettes
- **Typography** — `h1`–`h5`, `b1`/`b2`, `c1`–`c4`, `body*`, `headingSection`
- **Radius** — `small`, `medium`, `large`
- **Shadows** — `card`, `button`, `large`

Tokens live in `src/design-system/tokens.ts` and are used across screens and the `design-system` components.

## Scripts

| Script     | Command              | Description              |
| ---------- | -------------------- | ------------------------ |
| `start`    | `expo start`         | Start dev server         |
| `android`  | `expo start --android` | Run on Android        |
| `ios`      | `expo start --ios`   | Run on iOS               |
| `web`      | `expo start --web`   | Run in browser           |

## Contributing

1. Create a feature branch from `master`
2. Commit with clear messages
3. Open a PR against `master`

## License

Proprietary — Marvel Tech Apps.
