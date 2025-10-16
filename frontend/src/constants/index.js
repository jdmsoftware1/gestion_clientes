/**
 * Application constants
 */

export const PAYMENT_METHODS = [
  'Efectivo',
  'Transferencia',
  'Cheque',
  'Tarjeta de Crédito',
  'Tarjeta de Débito',
  'PayPal',
];

export const DEBT_WARNING_THRESHOLD = 50; // € - Oportunidad de venta
export const DELINQUENT_THRESHOLD_DAYS = 60; // días sin pagar

export const TABLE_ROWS_PER_PAGE = 10;

export const COLORS = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  opportunity: '#e8f5e9', // Verde claro para oportunidades
  delinquent: '#ffebee', // Rojo claro para morosos
};

export const API_ENDPOINTS = {
  SALESPEOPLE: '/salespeople',
  CLIENTS: '/clients',
  SALES: '/sales',
  PAYMENTS: '/payments',
  DASHBOARD: '/dashboard',
  IMPORT: '/import',
};