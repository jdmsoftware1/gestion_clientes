import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HistoricalPayment = sequelize.define('HistoricalPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cod_cliente_p: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nombre_c_p: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  apellidos_c_p: {
    type: DataTypes.STRING(40),
    allowNull: true,
  },
  fecha_pago: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  tipo_de_pago: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  cantidad_pago: {
    type: DataTypes.NUMERIC(10, 2),
    allowNull: true,
  },
  cod_pago: {
    type: DataTypes.INTEGER,
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
  tableName: 'historical_payments',
});

export default HistoricalPayment;
