# Pharmacy Finder - Mobile App

A React Native mobile application that helps customers find nearby pharmacies, check medicines availability, and place orders in real-time.

## 🎯 Features

- **Customer Authentication** - Secure login/signup with JWT
- **Nearby Pharmacies Search** - Find pharmacies within 10km radius using GPS
- **Interactive Map** - View pharmacies on map with real-time locations
- **Pharmacy Details** - View pharmacy information, opening hours, and operating days
- **Medicine Search** - Search medicines by name and pharmacy
- **Order Placement** - Place and track medicine orders
- **User Profile** - Manage user account and preferences
- **Push Notifications** - Real-time order updates (optional)

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State Management**: Context API
- **Authentication**: JWT + AsyncStorage
- **Maps**: React Native Maps
- **Location**: Expo Location API
- **Styling**: StyleSheet (Native)
- **Backend**: Node.js + Express + MongoDB

## 🚀 Getting Started

### Prerequisites

```bash
npm install -g expo-cli
node --version  # v18+
npm --version   # v8+
```

### Installation

```bash
# Clone repository
git clone https://github.com/Davibytes/pharmacy-finder.git
cd pharmacy-finder

# Install dependencies
npm install

# Install additional Expo packages
npx expo install expo-location
npx expo install expo-constants
```

### Running the App

```bash
# Start Expo development server
npm start

# For iOS (Mac only)
# Press 'i'

# For Android
# Press 'a'

# For Web
# Press 'w'
```

### Environment Setup

No `.env` file needed for mobile. API endpoint is configured in `src/services/api.js`.

**For Development (localhost):**
```javascript
const API_BASE_URL = 'http://localhost:5000';
```

**For Production (Live API):**
```javascript
const API_BASE_URL = 'https://api.YOUR_DOMAIN';
```

Then rebuild APK after changing.

## 📂 Project Structure