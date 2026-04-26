const dotenv = require('dotenv');

dotenv.config();

const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');

require('./src/models');

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await connectRedis();

    await testConnection();
    logger.info('Database connected successfully');

    await sequelize.sync();
    logger.info('Database synchronized successfully');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Swagger docs available at http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
