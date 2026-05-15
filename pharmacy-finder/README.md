# Pharmacy Finder Mobile App

Expo React Native mobile app for customers using the Pharmacy System platform.

## Features

- Customer signup and login
- Pharmacy signup and login flows
- Nearby pharmacy discovery using device location
- Medicine search across pharmacies
- Pharmacy details, opening status, and reviews
- Customer profile screen
- Admin and super admin navigation screens
- Shared API client with JWT authentication

## Tech Stack

- Expo
- React Native
- React Navigation
- Axios
- AsyncStorage
- Expo Location
- React Native Maps

## Requirements

- Node.js 18 or newer
- npm
- Expo CLI through `npx expo`
- Running backend API from `../pharmacy-finder-backend`

## Setup

```bash
npm install
```

## Run Locally

```bash
npm start
```

Then choose one of the Expo options:

- Press `a` for Android
- Press `i` for iOS on macOS
- Press `w` for web
- Scan the QR code with Expo Go on a physical device

## API Configuration

The API client is in:

```text
src/services/api.js
```

By default:

- Web uses `http://localhost:5000/api`
- Native devices try to use the Expo development host IP with port `5000`

For production or a specific backend URL, set:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

## Useful Scripts

```bash
npm start       # Start Expo
npm run android # Start Expo for Android
npm run ios     # Start Expo for iOS
npm run web     # Start Expo for web
npm run lint    # Run Expo lint
```

## Main Folders

```text
src/components/   Reusable UI components
src/context/      Auth and app context providers
src/navigation/   Root, customer, admin, and super admin navigation
src/screens/      App screens grouped by user area
src/services/     API client
src/styles/       Shared colors, spacing, typography, and component styles
src/utils/        Utility helpers
assets/           Static app assets
```

## Notes

Keep the backend running before testing login, signup, pharmacy search, or medicine search. If testing on a physical phone, the phone and development computer should be on the same network.
