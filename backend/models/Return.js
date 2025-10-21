import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  returnReason: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Devolución de producto',
  },
  clientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id'
    }
  },
}, {
  timestamps: true,
  tableName: 'returns',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Return;
