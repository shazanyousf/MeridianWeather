/**
 * Meridian Weather - Server Entry Point
 * Bootstraps the Express application, connects to MongoDB, and starts listening.
 */

// Load environment variables from .env before anything else
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Fix Node.js DNS resolution: Node can default to 127.0.0.1 (no resolver), which
// causes external hostnames (e.g. MongoDB Atlas) to fail with ECONNREFUSED.
// Override with known-good DNS servers (system DNS + public fallbacks).
const dns = require('dns');
try {
  const isLoopbackOnly = dns
    .getServers()
    .every((s) => s.startsWith('127.'));
  if (isLoopbackOnly) {
    // Node.js can default to 127.0.0.1 DNS (no resolver), which prevents
    // external hostnames (Open-Meteo, BigDataCloud, MongoDB Atlas) from
    // resolving, causing ECONNREFUSED/ECONNABORTED timeouts.
    // Override with reliable public resolvers (Google + Cloudflare).
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
    console.log('🌐 DNS servers configured:', dns.getServers().join(', '));
  }
} catch (e) {
  console.warn('DNS config skipped:', e.message);
}

const app = require('./app');
const connectDB = require('./config/db');
const { seedAdmins } = require('./utils/seed');

const PORT = process.env.PORT || 5000;

// Constants for server shutdown
let server;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default admin if none exists
    await seedAdmins();

    // Start listening
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
    });
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Set a different PORT in server/.env.`);
      } else {
        console.error(`❌ Server failed to listen on port ${PORT}:`, error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  shutdown('unhandledRejection');
});

// Start
startServer();
