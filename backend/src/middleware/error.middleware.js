import config from '../config/env.js';

/**
 * Global error handler — catches all unhandled errors
 * Frontend reads: error.response?.data?.message
 */
export const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 && config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  res.status(statusCode).json({ message });
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};
