import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Salesperson = sequelize.define('Salesperson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  internalCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'salespeople',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Salesperson;