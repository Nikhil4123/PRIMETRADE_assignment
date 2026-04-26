const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const commonConfig = {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    ...commonConfig,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    ...commonConfig,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432)
  });
}

const testConnection = async () => {
  await sequelize.authenticate();
};

module.exports = {
  sequelize,
  testConnection
};
