const { DataTypes, UUIDV4 } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'done'),
    allowNull: false,
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
});

module.exports = Task;
