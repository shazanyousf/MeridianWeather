/**
 * Meridian Weather - Express Application Configuration
 * Sets up middleware, routes, error handling, and security.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { requestLogger } = require('./middleware/requestLogger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const alertRoutes = require('./routes/alertRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const searchRoutes = require('./routes/searchRoutes');
const reportRoutes = require('./routes/reportRoutes');
const announcementRoutes = require('./routes/announcementRoutes');

const app = express();

// ---------- Security & General Middleware ----------

// Set security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// Request body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression for performance
app.use(compression());

// HTTP request logging (dev only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize MongoDB injection
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP parameter pollution
app.use(hpp());

// Rate limiting (global)
const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', globalLimiter);

// Custom request logger (logs to DB for admin analytics)
app.use(requestLogger);

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Meridian Weather API is running',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/announcements', announcementRoutes);

// ---------- 404 handler ----------
app.use(notFound);

// ---------- Global error handler ----------
app.use(errorHandler);

// For testing: export app without listening
module.exports = app;
