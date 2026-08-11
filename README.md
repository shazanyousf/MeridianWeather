# 🌦️ Meridian Weather

**Smart Weather Forecasting & Climate Analytics System**

**MCA Final Year Project** — a full-stack weather application with professional UI, real-time weather APIs, authentication, analytics, admin dashboard, charts, AI weather recommendations, and comprehensive documentation.

---

## 🌐 Overview

Meridian Weather is a modern, responsive weather forecasting and climate analytics platform. It provides real-time weather, hourly and 7-day forecasts, detailed highlights (UV, AQI, humidity, wind, and moon phase), AI-powered recommendations, city comparison, charts, a dedicated historical-weather lookup, reporting, and an admin dashboard.

The application is built with a **Next.js + Express + MongoDB** (MERN-style) architecture:
- **Frontend:** Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express REST API
- **Database:** MongoDB (Mongoose)

---

## ✨ Features

### Authentication
- Register / Login / Logout
- JWT (Access + Refresh tokens) with automatic token refresh
- Remember Me
- Email verification (OTP)
- Forgot / Reset password (with OTP)
- Profile picture upload (Cloudinary)
- Profile editing, change password, delete account
- Session tracking & user preferences

### Weather
- Search by city, state, country, zip, coordinates, and voice
- Auto-complete suggestions, recent searches, popular & trending cities
- Current weather + today's highlights
- Hourly + 7-day forecast
- Past 7-day forecast for the currently viewed city
- Air quality (AQI) index
- Weather animations, dark/light mode

### Historical Weather
- Dedicated **Historical** page at `/historical`
- City-name autocomplete with location suggestions
- Exact date picker (year, month, and day)
- Daily archived high/low temperature, weather condition, precipitation, rain, snow, wind, sunrise, and sunset
- Historical data is sourced from the Open-Meteo Archive API; the archive is available from 1940 and may lag the current date by a few days

### Charts & Analytics
- Temperature, humidity, rainfall, wind charts (Recharts + Chart.js)
- Climate analytics and trend analysis
- Interactive city comparison (up to 4 cities)

### AI Recommendations
- Travel, clothing, health, outdoor activity, and crop advisories
- Best time to visit, disaster alerts

### Notifications & Alerts
- In-app notifications
- Weather alerts (storm / rain / heatwave / cold-wave / AQI)

### User Dashboard
- Overview, favorites, recent searches, history, notifications, analytics, feedback, profile, settings

### Admin Panel
- Dashboard overview stats (users, searches, visitors, API calls, sessions)
- View / delete / block / promote users
- User growth analytics & daily visitors
- Search statistics & trending queries
- API usage & provider stats
- Announcements, feedback, and weather alerts management

---

## 🛠️ Technology Stack

| Layer           | Technology & Tools                                                                 |
|-----------------|------------------------------------------------------------------------------------|
| **Frontend**    | React.js, Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Redux Toolkit, React Query, Axios, Recharts, Chart.js, react-hot-toast |
| **Backend**     | Node.js, Express.js, REST API, JWT auth, Mongoose ORM                              |
| **Database**    | MongoDB Atlas (cloud), Mongoose schemas & models                                   |
| **State Mgmt**  | Redux Toolkit (auth, weather, UI slices) + React Context (theme, auth providers)   |
| **Auth**        | JWT (Access + Refresh tokens), Email verification (OTP), Forgot/Reset password, Remember Me |
| **Charts**      | Recharts, Chart.js                                                               |
| **Cloud / Files**| Cloudinary (profile image upload)                                                   |
| **Email**       | NodeMailer (email verification, alerts, notifications)                              |
| **Weather APIs**| Open-Meteo (forecast + historical archive), OpenWeatherMap (fallback + AQI), OpenStreetMap Nominatim (geocoding) |
| **Security & Perf.**| Helmet, express-rate-limit, express-validator, bcrypt, CORS, compression, express-mongo-sanitize, hpp, xss-clean |

### Key Libraries
- **Client:** `next`, `react`, `typescript`, `tailwindcss`, `framer-motion`, `@reduxjs/toolkit`, `react-redux`, `axios`, `recharts`, `chart.js`, `react-hook-form`, `react-hot-toast`, `react-icons`, `next-themes`, `@tanstack/react-query`, `jspdf`, `xlsx`, `html2canvas`
- **Server:** `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `nodemailer`, `cloudinary`, `multer`, `helmet`, `cors`, `compression`, `express-rate-limit`, `express-validator`, `express-mongo-sanitize`, `hpp`, `xss-clean`, `morgan`, `axios`

---

## 📁 Project Structure

```
Shazan/
├── README.md
├── .gitignore
├── package.json              # Root scripts (dev, build, seed, install)
├── client/                   # Next.js frontend
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── src/
│       ├── app/              # Next.js App Router pages
│       │   ├── layout.tsx    # Root layout (metadata, providers)
│       │   ├── page.tsx      # Home page
│       │   ├── admin/        # Admin dashboard (users, analytics, searches, api-usage, feedback, announcements)
│       │   ├── admin-login/
│       │   ├── charts/       # Charts & analytics
│       │   ├── compare/      # City comparison
│       │   ├── historical/   # Exact-date historical weather lookup
│       │   ├── dashboard/    # User dashboard (overview, favorites, history, notifications, analytics, feedback, profile, settings)
│       │   ├── login/ register/ forgot-password/ reset-password/ verify-email/
│       │   └── weather/      # Weather page
│       ├── components/       # Reusable UI, layout, charts, weather components
│       ├── context/          # Auth, Theme, Providers
│       ├── hooks/            # useDebounce, useGeolocation, useLocalStorage, useVoiceSearch
│       ├── redux/            # store + slices (auth, weather, ui)
│       ├── services/         # api, auth, user, weather, admin services
│       ├── types/            # TypeScript type definitions
│       └── utils/            # cn, format helpers
└── server/                   # Express backend
    ├── .env.example
    ├── package.json
    ├── uploads/              # Profile image uploads
    └── src/
        ├── server.js         # Entry point (DNS fix, DB connect, seed admin)
        ├── app.js            # Express app config (middleware, routes)
        ├── config/           # db, cloudinary, nodemailer
        ├── controllers/      # auth, user, weather, admin, favorite, alert, notification, feedback, search, report, announcement
        ├── middleware/       # auth, errorHandler, notFound, requestLogger
        ├── models/           # User, Admin, Favorite, WeatherHistory, SearchLog, ApiLog, UserSession, Notification, WeatherAlert, Feedback, Announcement
        ├── routes/           # auth, user, weather, admin, favorite, alert, notification, feedback, search, report, announcement
        ├── services/         # weatherService, aiService
        ├── utils/            # appError, asyncHandler, emailTemplates, seed, token
        └── validators/       # authValidator, validate
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- OpenWeatherMap API key (for fallback weather + air quality)

### 1. Clone & Install

```bash
git clone https://github.com/shazanyousf/MeridianWeather.git
cd Shazan

# Install server & client dependencies
npm run install:all
```

### 2. Configure Environment

Create `.env` files from the provided examples:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Fill in your API keys, database URI, and SMTP config.

### 3. Run the project

```bash
# Run both server and client concurrently
npm run dev

# Or separately
npm run dev:server   # http://localhost:5001 (the current local configuration)
npm run dev:client   # http://localhost:3000
```

Open `http://localhost:3000` in your browser. The Historical Weather feature is available at `http://localhost:3000/historical`.

### 4. Seed sample data

```bash
npm run seed
```

On first start, the server **automatically seeds a default admin** account:

| Role          | Email                          | Password     |
|---------------|--------------------------------|--------------|
| Super Admin   | `admin@meridianweather.com`    | `Admin@12345`|

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable                       | Description                              |
|--------------------------------|------------------------------------------|
| `PORT`                         | Server port (currently configured as `5001`; application fallback is `5000`) |
| `NODE_ENV`                     | `development` / `production`             |
| `MONGODB_URI`                  | MongoDB Atlas connection string          |
| `JWT_ACCESS_SECRET`            | Access token secret                      |
| `JWT_REFRESH_SECRET`           | Refresh token secret                     |
| `JWT_ACCESS_EXPIRES`           | Access token expiry (e.g. `15m`)         |
| `JWT_REFRESH_EXPIRES`          | Refresh token expiry (e.g. `7d`)         |
| `CLIENT_URL`                   | Frontend origin (e.g. `http://localhost:3000`) |
| `EMAIL_HOST` / `EMAIL_PORT`    | SMTP host & port                         |
| `EMAIL_SECURE`                 | Use TLS/SSL (`true`/`false`)             |
| `EMAIL_USER` / `EMAIL_PASSWORD`| SMTP credentials                         |
| `EMAIL_FROM`                   | Sender address                           |
| `CLOUDINARY_CLOUD_NAME`        | Cloudinary cloud name                    |
| `CLOUDINARY_API_KEY`           | Cloudinary API key                       |
| `CLOUDINARY_API_SECRET`        | Cloudinary API secret                    |
| `OPENWEATHER_API_KEY`          | OpenWeatherMap key (fallback + AQI)      |
| `WEATHERAPI_KEY`               | WeatherAPI key (optional)                |
| `CORS_ORIGIN`                  | Allowed CORS origins (comma-separated)   |
| `RATE_LIMIT_WINDOW`            | Rate-limit window (ms)                   |
| `RATE_LIMIT_MAX`               | Max requests per window                  |

### Client (`client/.env.local`)

| Variable                       | Description                              |
|--------------------------------|------------------------------------------|
| `NEXT_PUBLIC_API_URL`          | Backend API base URL (e.g. `http://localhost:5001`) |
| `NEXT_PUBLIC_APP_NAME`         | App display name (`Meridian Weather`)    |
| `NEXT_PUBLIC_APP_DESCRIPTION`  | App description                          |

---

## Historical Weather API

The Historical page resolves the selected city to latitude/longitude and then requests daily archive data from the backend.

```text
GET /api/weather/past?lat=<latitude>&lon=<longitude>&date=YYYY-MM-DD
```

The `date` must be on or after `1940-01-01`, cannot be in the future, and must be available in the upstream archive. The response contains daily summary data, so the temperatures are the day’s high and low rather than a measurement at an exact time.

---
