import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

// Get dashboard KPIs
export const getDashboardKPIs = async (req, res) => {
  try {
    // Total debt
    const totalDebtResult = await sequelize.query(
      `
      SELECT COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as total_debt
      FROM sales s
      LEFT JOIN payments p ON s."clientId" = p."clientId"
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const totalDebt = parseFloat(totalDebtResult[0].total_debt) || 0;

    // Sales in last 30 days
    const last30DaysSalesResult = await sequelize.query(
      `
      SELECT COALESCE(SUM(amount), 0) as total_sales
      FROM sales
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const totalSalesLast30Days = parseFloat(last30DaysSalesResult[0].total_sales) || 0;

    // Payments in last 30 days
    const last30DaysPaymentsResult = await sequelize.query(
      `
      SELECT COALESCE(SUM(amount), 0) as total_payments
      FROM payments
      WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    const totalPaymentsLast30Days = parseFloat(last30DaysPaymentsResult[0].total_payments) || 0;

    res.json({
      totalDebt,
      totalSalesLast30Days,
      totalPaymentsLast30Days,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get salesperson rankings
export const getSalespersonRankings = async (req, res) => {
  try {
    const rankings = await sequelize.query(
      `
      SELECT 
        sp.id,
        sp.name,
        sp.email,
        COALESCE(SUM(s.amount), 0) as total_sold
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c."salespersonId"
      LEFT JOIN sales s ON c.id = s."clientId"
      GROUP BY sp.id, sp.name, sp.email
      ORDER BY total_sold DESC
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(
      rankings.map((r) => ({
        ...r,
        total_sold: parseFloat(r.total_sold) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get delinquent clients (top 10)
export const getDelinquentClients = async (req, res) => {
  try {
    const delinquent = await sequelize.query(
      `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        c."salespersonId",
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt,
        MAX(p."createdAt") as last_payment_date
      FROM clients c
      LEFT JOIN salespeople sp ON c."salespersonId" = sp.id
      LEFT JOIN sales s ON c.id = s."clientId"
      LEFT JOIN payments p ON c.id = p."clientId"
      GROUP BY c.id, c.name, c.phone, c.email, c."salespersonId", sp.name
      HAVING (COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0)
        AND (MAX(p."createdAt") IS NULL OR MAX(p."createdAt") < NOW() - INTERVAL '60 days')
      ORDER BY debt DESC
      LIMIT 10
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(
      delinquent.map((c) => ({
        ...c,
        debt: parseFloat(c.debt) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sales opportunities (clients with debt < 50€)
export const getSalesOpportunities = async (req, res) => {
  try {
    const opportunities = await sequelize.query(
      `
      SELECT 
        c.id,
        c.name,
        c.phone,
        c.email,
        c."salespersonId",
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
      FROM clients c
      LEFT JOIN salespeople sp ON c."salespersonId" = sp.id
      LEFT JOIN sales s ON c.id = s."clientId"
      LEFT JOIN payments p ON c.id = p."clientId"
      GROUP BY c.id, c.name, c.phone, c.email, c."salespersonId", sp.name
      HAVING (COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) < 50)
      ORDER BY debt ASC
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(
      opportunities.map((c) => ({
        ...c,
        debt: parseFloat(c.debt) || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};