/**
 * Centralized Error Handling Middleware for NEXORA API
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.url}:`, err);

  // PostgreSQL specific error code handling
  if (err.code === '23505') { // unique_violation
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this information already exists.',
        detail: err.detail
      }
    });
  }

  if (err.code === '23503') { // foreign_key_violation
    return res.status(400).json({
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced entity does not exist.',
        detail: err.detail
      }
    });
  }

  if (err.code === '23514') { // check_violation
    return res.status(422).json({
      success: false,
      error: {
        code: 'CONSTRAINT_VIOLATION',
        message: 'Data constraint violation. Please verify input values.'
      }
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
