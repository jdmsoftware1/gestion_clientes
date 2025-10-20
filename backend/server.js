import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import './models/index.js';

// Import routes
import salespeopleRoutes from './routes/salespeople.js';
import clientRoutes from './routes/clients.js';
import saleRoutes from './routes/sales.js';
import paymentRoutes from './routes/payments.js';
import dashboardRoutes from './routes/dashboard.js';
import importRoutes from './routes/import.js';
import monthClosureRoutes from './routes/monthClosures.js';
import testRoutes from './routes/tests.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/salespeople', salespeopleRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/import', importRoutes);
app.use('/api/month-closures', monthClosureRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Initialize database and start server
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synchronized');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Database sync error:', error);
});