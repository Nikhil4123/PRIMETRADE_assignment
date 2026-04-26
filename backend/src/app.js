const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { REDIS_ENABLED, redisClient } = require('./config/redis');
const v1Routes = require('./routes/v1');
const errorMiddleware = require('./middlewares/error.middleware');
const { errorResponse, successResponse } = require('./utils/apiResponse');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
const rateLimiterOptions = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
};

if (REDIS_ENABLED) {
  rateLimiterOptions.store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args)
  });
  rateLimiterOptions.passOnStoreError = true;
  logger.info('Rate limiter is configured with Redis store');
}

app.use(rateLimit(rateLimiterOptions));

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (req, res) => {
  return successResponse(res, { status: 'ok' }, 'Service is healthy', 200);
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', v1Routes);

app.use((req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

app.use(errorMiddleware);

module.exports = app;
