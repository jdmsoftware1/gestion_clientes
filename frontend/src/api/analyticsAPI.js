import axiosInstance from './axiosConfig';

// API para análisis avanzados y métricas empresariales
const analyticsAPI = {
  // Obtener KPIs avanzados
  getAdvancedKPIs: (params = {}) => {
    return axiosInstance.get('/analytics/kpis', { params });
  },

  // Obtener datos de tendencias temporales
  getTrendData: (params = {}) => {
    return axiosInstance.get('/analytics/trends', { params });
  },

  // Obtener comparación entre vendedores
  getSalespersonComparison: (params = {}) => {
    return axiosInstance.get('/analytics/comparison', { params });
  },

  // Obtener análisis de rentabilidad
  getProfitabilityAnalysis: (params = {}) => {
    return axiosInstance.get('/analytics/profitability', { params });
  },

  // Obtener análisis de deuda irrecuperable
  getBadDebtAnalysis: (params = {}) => {
    return axiosInstance.get('/analytics/bad-debt', { params });
  },

  // Obtener alertas del negocio
  getBusinessAlerts: (params = {}) => {
    return axiosInstance.get('/analytics/alerts', { params });
  },

  // Obtener configuración de alertas
  getAlertsConfig: () => {
    return axiosInstance.get('/analytics/alerts/config');
  },

  // Obtener predicción de ventas
  getSalesPrediction: (params = {}) => {
    return axiosInstance.get('/analytics/prediction', { params });
  },

  // Obtener probabilidad de pago por cliente
  getPaymentProbability: (params = {}) => {
    return axiosInstance.get('/analytics/payment-probability', { params });
  },

  // Obtener análisis de estacionalidad
  getSeasonalityAnalysis: (params = {}) => {
    return axiosInstance.get('/analytics/seasonality', { params });
  },

  // Obtener datos mensuales por vendedor (vista Excel-like)
  getMonthlyData: (params = {}) => {
    return axiosInstance.get('/analytics/monthly', { params });
  }
};

export default analyticsAPI;
