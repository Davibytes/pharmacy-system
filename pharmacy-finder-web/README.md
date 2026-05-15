# Pharmacy Finder Web Admin

React web dashboard for pharmacy users in the Pharmacy System platform.

## Features

- Pharmacy user signup and login
- Protected dashboard routes
- Pharmacy profile management
- Inventory page
- Orders page
- Password reset pages
- Shared API service for backend communication

## Tech Stack

- React 18
- React Router
- Tailwind CSS
- Create React App
- Fetch API

## Requirements

- Node.js 18 or newer
- npm
- Running backend API from `../pharmacy-finder-backend`

## Setup

```bash
npm install
```

## Run Locally

```bash
npm start
```

Default URL:

```text
http://localhost:3000
```

## API Configuration

The API service is in:

```text
src/services/api.js
```

By default it uses:

```text
http://localhost:5000/api
```

For production, create an environment file or set:

```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api
```

Restart the dev server after changing environment variables.

## Useful Scripts

```bash
npm start      # Start development server
npm run build  # Create production build in build/
npm test       # Run tests
```

## Main Folders

```text
src/components/   Reusable UI and route guard components
src/context/      Authentication context
src/pages/        Dashboard, auth, pharmacy, inventory, orders, and profile pages
src/services/     API service helpers
public/           Static public assets
build/            Production output after npm run build
```

## Production Build

```bash
npm run build
```

Deploy the generated `build/` folder with Nginx, Hostinger, Netlify, Vercel, or another static hosting provider. When using Nginx with React Router, configure all unknown routes to return `index.html`.
