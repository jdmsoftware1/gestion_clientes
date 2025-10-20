import express from 'express';
import {
  testGetAdvancedKPIs,
  testGetTrendData,
  testGetSalespersonComparison,
  testGetBusinessAlerts,
  testGetSalesPrediction
} from './testAnalyticsController.js';

const router = express.Router();

console.log('🧪 Setting up test analytics routes...');

// Rutas de prueba para análisis avanzados
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

console.log('✅ Test analytics routes configured');

export default router;
