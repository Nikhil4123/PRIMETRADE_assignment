const { errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  logger.error(err.stack || err.message || 'Unhandled error');

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return errorResponse(res, message, statusCode, err.errors);
};

module.exports = errorMiddleware;
