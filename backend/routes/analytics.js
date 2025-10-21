import express from 'express';
import {
  getAdvancedKPIs,
  getTrendData,
  getSalespersonComparison,
  getProfitabilityAnalysis,
  getBadDebtAnalysis,
  getBusinessAlerts,
  getAlertsConfig,
  getSalesPrediction,
  getPaymentProbability,
  getSeasonalityAnalysis,
  getMonthlyData
} from '../controllers/analyticsController.js';

// Controladores de test inline para evitar problemas de importación
const testGetAdvancedKPIs = async (req, res) => {
  try {
    console.log('🧪 Testing Advanced KPIs...');
    const mockData = {
      conversionRate: { clients_with_payments: 150, total_clients: 300, conversion_rate: 50.0 },
      avgCollectionTime: { avg_collection_days: 45.5 },
      salesEfficiency: [
        { salesperson_name: 'Bego', total_sales: 85, active_days: 30, sales_per_day: 2.83 },
        { salesperson_name: 'David', total_sales: 72, active_days: 28, sales_per_day: 2.57 }
      ],
      debtDistribution: [
        { debt_range: '0-100€', client_count: 50, total_debt: 3500 },
        { debt_range: '101-500€', client_count: 120, total_debt: 35000 }
      ]
    };
    console.log('✅ KPIs test data generated successfully');
    res.json(mockData);
  } catch (error) {
    console.error('❌ Error in testGetAdvancedKPIs:', error);
    res.status(500).json({ error: error.message });
  }
};

const testGetTrendData = async (req, res) => {
  try {
    console.log('🧪 Testing Trend Data...');
    const generateTrendData = (days = 30) => {
      const data = [];
      const today = new Date();
      for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const periodLabel = date.toISOString().split('T')[0];
        data.push({
          period: date.toISOString(),
          period_label: periodLabel,
          sales_amount: Math.round((Math.random() * 5000 + 1000) * 100) / 100,
          payments_amount: Math.round((Math.random() * 3000 + 500) * 100) / 100
        });
      }
      return data;
    };
    const mockData = {
      salesTrend: generateTrendData(30),
      paymentsTrend: generateTrendData(30)
    };
    console.log('✅ Trend data test generated successfully');
    res.json(mockData);
  } catch (error) {
    console.error('❌ Error in testGetTrendData:', error);
    res.status(500).json({ error: error.message });
  }
};

const testGetSalespersonComparison = async (req, res) => {
  try {
    console.log('🧪 Testing Salesperson Comparison...');
    const mockData = [
      { salesperson_name: 'Bego', sales_amount: 45000, payments_amount: 32000, pending_debt: 13000, client_count: 85 },
      { salesperson_name: 'David', sales_amount: 38000, payments_amount: 28000, pending_debt: 10000, client_count: 72 }
    ];
    console.log('✅ Comparison data test generated successfully');
    res.json(mockData);
  } catch (error) {
    console.error('❌ Error in testGetSalespersonComparison:', error);
    res.status(500).json({ error: error.message });
  }
};

const testGetBusinessAlerts = async (req, res) => {
  try {
    console.log('🧪 Testing Business Alerts...');
    const alerts = [
      {
        id: 'test_old_debt',
        type: 'critical',
        title: '15 clientes con deuda antigua',
        description: 'Clientes sin actividad por más de 90 días',
        priority: 'high',
        icon: 'warning',
        action: 'Revisar y contactar urgentemente',
        createdAt: new Date().toISOString(),
        data: [
          { client_name: 'Cliente Test 1', phone: '123456789', salesperson_name: 'Bego', debt_amount: 1500, days_since_last_activity: 120 }
        ]
      }
    ];
    const summary = { total: alerts.length, critical: 1, warning: 0, info: 0, success: 0 };
    console.log('✅ Alerts test data generated successfully');
    res.json({ alerts, summary });
  } catch (error) {
    console.error('❌ Error in testGetBusinessAlerts:', error);
    res.status(500).json({ error: error.message });
  }
};

const testGetSalesPrediction = async (req, res) => {
  try {
    console.log('🧪 Testing Sales Prediction...');
    const mockData = {
      historicalData: [
        { period_label: '2025-09', sales_count: 35, sales_amount: 10500 },
        { period_label: '2025-10', sales_count: 42, sales_amount: 12200 }
      ],
      predictions: [
        { period_label: '2025-11', predicted_sales_amount: 11800, predicted_sales_count: 38, confidence: 70 }
      ],
      summary: { avgMonthlySales: 10500, avgMonthlyCount: 35, trend: 5.2, trendDirection: 'up' }
    };
    console.log('✅ Prediction test data generated successfully');
    res.json(mockData);
  } catch (error) {
    console.error('❌ Error in testGetSalesPrediction:', error);
    res.status(500).json({ error: error.message });
  }
};

const router = express.Router();

// Rutas para análisis avanzados
router.get('/kpis', getAdvancedKPIs);
router.get('/trends', getTrendData);
router.get('/comparison', getSalespersonComparison);

// Rutas para análisis de rentabilidad
router.get('/profitability', getProfitabilityAnalysis);
router.get('/bad-debt', getBadDebtAnalysis);

// Rutas para sistema de alertas
router.get('/alerts', getBusinessAlerts);
router.get('/alerts/config', getAlertsConfig);

// Rutas para análisis predictivo
router.get('/prediction', getSalesPrediction);
router.get('/payment-probability', getPaymentProbability);
router.get('/seasonality', getSeasonalityAnalysis);
router.get('/monthly', getMonthlyData);

// 🧪 RUTAS DE TEST - Datos simulados para pruebas
router.get('/test/kpis', testGetAdvancedKPIs);
router.get('/test/trends', testGetTrendData);
router.get('/test/comparison', testGetSalespersonComparison);
router.get('/test/alerts', testGetBusinessAlerts);
router.get('/test/prediction', testGetSalesPrediction);

// Ruta de estado para verificar que las pruebas funcionan
router.get('/test/status', (req, res) => {
  res.json({
    status: 'OK',
    message: '🧪 Test Analytics API is running',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      '/api/analytics/test/kpis',
      '/api/analytics/test/trends',
      '/api/analytics/test/comparison', 
      '/api/analytics/test/alerts',
      '/api/analytics/test/prediction'
    ]
  });
});

export default router;
