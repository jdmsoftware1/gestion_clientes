import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/kpis', dashboardController.getDashboardKPIs);
router.get('/rankings', dashboardController.getSalespersonRankings);
router.get('/collectors', dashboardController.getCollectorsRankings);
router.get('/delinquent', dashboardController.getDelinquentClients);
router.get('/opportunities', dashboardController.getSalesOpportunities);
router.get('/historical', dashboardController.getHistoricalAnalytics);

export default router;