import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MonthClosure = sequelize.define('MonthClosure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nombre del cierre (ej: "Primer Cierre Octubre", "Cierre Navidad")'
  },
  dateFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_from',
    comment: 'Fecha de inicio del período'
  },
  dateTo: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date_to',
    comment: 'Fecha de fin del período'
  },
  salespersonId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'salesperson_id',
    comment: 'ID del vendedor específico, null para TODOS'
  },
  totalSales: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_sales',
    comment: 'Total de ventas en el período'
  },
  totalPayments: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_payments',
    comment: 'Total de pagos en el período'
  },
  totalDebt: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_debt',
    comment: 'Deuda total al momento del cierre'
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'net_amount',
    comment: 'Neto del período (ventas - pagos)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción adicional del cierre'
  },
  closedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'closed_by',
    comment: 'Usuario que realizó el cierre'
  }
}, {
  timestamps: true,
  tableName: 'month_closures',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['date_from', 'date_to']
    },
    {
      fields: ['name']
    },
    {
      fields: ['salesperson_id']
    }
  ]
});

export default MonthClosure;
