# Pharmacy Finder Backend

Express and MongoDB API for the Pharmacy System platform.

## Features

- Customer authentication
- Pharmacy authentication
- JWT-protected routes
- Pharmacy listings and nearby pharmacy search
- Medicine search and pharmacy inventory endpoints
- Order endpoints
- Password reset email support with Nodemailer
- Configurable CORS for local and production frontends

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens
- bcryptjs
- Nodemailer
- dotenv
- nodemon for development

## Requirements

- Node.js 18 or newer
- npm
- MongoDB locally or MongoDB Atlas

## Setup

```bash
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Update `.env` with your real values.

## Environment Variables

```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pharmacy-finder
JWT_SECRET=replace-with-a-long-random-secret
PASSWORD_RESET_SECRET=replace-with-a-different-long-random-secret

APP_NAME=Pharmacy Finder
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
MAIL_FROM="Pharmacy Finder <no-reply@example.com>"
```

Optional production CORS values:

```text
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

## Run Locally

```bash
npm run dev
```

Default URL:

```text
http://localhost:5000
```

Health check:

```text
GET /
```

Expected response:

```json
{
  "message": "Pharmacy Finder API is running"
}
```

## Useful Scripts

```bash
npm start       # Run with node
npm run dev     # Run with nodemon
npm run test:email # Test email configuration
```

## API Route Groups

```text
/api/auth        Authentication and current user
/api/pharmacies  Pharmacy listing, details, profile, and review routes
/api/medicines   Medicine search and pharmacy medicine routes
/api/orders      Order routes
```

## Main Folders

```text
config/       Database configuration
controllers/  Request handlers
middleware/   Auth and route middleware
models/       Mongoose models
routes/       Express route definitions
scripts/      Utility scripts
utils/        Shared helpers
```

## Production Notes

Use MongoDB Atlas or a secured MongoDB server in production. Run this API behind Nginx with PM2, set `NODE_ENV=production`, configure `CORS_ORIGIN`, and use HTTPS through Certbot or your hosting provider.

Never commit `.env` with real secrets.
