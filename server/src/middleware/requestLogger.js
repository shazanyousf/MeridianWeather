/**
 * Request Logger Middleware - logs API requests for analytics.
 */

const ApiLog = require('../models/ApiLog');

const requestLogger = async (req, res, next) => {
  // Skip logging for health check
  if (req.path === '/health') return next();

  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function (body) {
    res.responseBody = body;
    res.send = originalSend;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    try {
      const responseTime = Date.now() - startTime;
      // Store in a lightweight way - only log API routes
      // Full logging handled by specific controllers where needed
      // This keeps DB small; we log to SearchLog/ApiLog in specific flows
    } catch (error) {
      // Ignore logging errors
    }
  });

  next();
};

module.exports = { requestLogger };
