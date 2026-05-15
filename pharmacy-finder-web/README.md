# Pharmacy Finder - Web Admin Panel

A React-based web application for pharmacy managers to manage inventory, process orders, and view business analytics in real-time.

## 🎯 Features

- **Pharmacy Authentication** - Secure login/signup with JWT
- **Real-time Dashboard** - View daily stats (orders, revenue, medicines)
- **Inventory Management** - Add, edit, delete medicines with details
- **Order Management** - View customer orders and update status
- **Pharmacy Profile** - Manage pharmacy details and opening hours
- **Opening Hours** - Set daily operating hours and days
- **Analytics** - Track sales, low stock alerts, and customer orders
- **Responsive Design** - Works on desktop, tablet, and mobile browsers

## 💻 Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **State Management**: Context API
- **Authentication**: JWT + localStorage
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App

## 🚀 Getting Started

### Prerequisites

```bash
node --version  # v18+
npm --version   # v8+
```

### Installation

```bash
# Clone repository
git clone https://github.com/Davibytes/pharmacy-finder-web.git
cd pharmacy-finder-web

# Install dependencies
npm install

# Install Tailwind CSS (if not already done)
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

### Running Development Server

```bash
npm start
```

App runs on: `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Output: `build/` folder ready for deployment

## 📂 Project Structure