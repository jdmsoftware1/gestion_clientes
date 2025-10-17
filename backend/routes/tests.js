import express from 'express';
import { runDashboardTests, testEndpoint } from '../controllers/testController.js';

const router = express.Router();

// Ejecutar batería completa de tests del dashboard
router.get('/dashboard', runDashboardTests);

// Test específico de endpoint
router.post('/endpoint', testEndpoint);

export default router;
