import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistoricalSale = sequelize.define('HistoricalSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  codCom: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  codArt: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  codCli: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombreCli: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  apellidosCli: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  nombreArt: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  precio: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  subtotal: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  total: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  fechaCom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  vista: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  cod_user: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  period_label: {
    type: DataTypes.STRING(100),
    defaultValue: 'Anteriores a Octubre 2025',
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'historical_sales',
});

export default HistoricalSale;
