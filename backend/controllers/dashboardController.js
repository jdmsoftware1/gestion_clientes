import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

// Get dashboard KPIs
export const getDashboardKPIs = async (req, res) => {
  try {
    const { salespersonId, dateFrom, dateTo } = req.query;
    
    if (salespersonId && salespersonId !== 'TODOS') {
      // Query with filter
      const totalDebtResult = await sequelize.query(
        `SELECT 
          COALESCE(SUM(s.amount), 0) as total_sales,
          COALESCE(SUM(p.amount), 0) as total_payments
        FROM clients c
        LEFT JOIN sales s ON c.id = s.client_id
        LEFT JOIN payments p ON c.id = p.client_id
        WHERE c.salesperson_id = :salespersonId`,
        { 
          replacements: { salespersonId }, 
          type: sequelize.QueryTypes.SELECT 
        }
      );

      const last30DaysSalesResult = await sequelize.query(
        `SELECT COALESCE(SUM(s.amount), 0) as total_sales
        FROM sales s
        LEFT JOIN clients c ON s.client_id = c.id
        WHERE s.created_at >= NOW() - INTERVAL '30 days'
        AND c.salesperson_id = :salespersonId`,
        { 
          replacements: { salespersonId }, 
          type: sequelize.QueryTypes.SELECT 
        }
      );

      const last30DaysPaymentsResult = await sequelize.query(
        `SELECT COALESCE(SUM(p.amount), 0) as total_payments
        FROM payments p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.created_at >= NOW() - INTERVAL '30 days'
        AND c.salesperson_id = :salespersonId`,
        { 
          replacements: { salespersonId }, 
          type: sequelize.QueryTypes.SELECT 
        }
      );

      const totalSales = parseFloat(totalDebtResult[0]?.total_sales) || 0;
      const totalPayments = parseFloat(totalDebtResult[0]?.total_payments) || 0;
      const totalDebt = totalSales - totalPayments;
      const totalSalesLast30Days = parseFloat(last30DaysSalesResult[0]?.total_sales) || 0;
      const totalPaymentsLast30Days = parseFloat(last30DaysPaymentsResult[0]?.total_payments) || 0;

      res.json({
        totalDebt,
        totalSalesLast30Days,
        totalPaymentsLast30Days,
      });
    } else {
      // Query without filter (TODOS)
      const totalDebtResult = await sequelize.query(
        `SELECT 
          COALESCE(SUM(s.amount), 0) as total_sales,
          COALESCE(SUM(p.amount), 0) as total_payments
        FROM clients c
        LEFT JOIN sales s ON c.id = s.client_id
        LEFT JOIN payments p ON c.id = p.client_id`,
        { type: sequelize.QueryTypes.SELECT }
      );

      const last30DaysSalesResult = await sequelize.query(
        `SELECT COALESCE(SUM(s.amount), 0) as total_sales
        FROM sales s
        WHERE s.created_at >= NOW() - INTERVAL '30 days'`,
        { type: sequelize.QueryTypes.SELECT }
      );

      const last30DaysPaymentsResult = await sequelize.query(
        `SELECT COALESCE(SUM(p.amount), 0) as total_payments
        FROM payments p
        WHERE p.created_at >= NOW() - INTERVAL '30 days'`,
        { type: sequelize.QueryTypes.SELECT }
      );

      const totalSales = parseFloat(totalDebtResult[0]?.total_sales) || 0;
      const totalPayments = parseFloat(totalDebtResult[0]?.total_payments) || 0;
      const totalDebt = totalSales - totalPayments;
      const totalSalesLast30Days = parseFloat(last30DaysSalesResult[0]?.total_sales) || 0;
      const totalPaymentsLast30Days = parseFloat(last30DaysPaymentsResult[0]?.total_payments) || 0;

      res.json({
        totalDebt,
        totalSalesLast30Days,
        totalPaymentsLast30Days,
      });
    }
  } catch (error) {
    console.error('Error in getDashboardKPIs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get salesperson rankings
export const getSalespersonRankings = async (req, res) => {
  try {
    const rankings = await sequelize.query(
      `SELECT 
        sp.id,
        sp.name,
        sp.email,
        COALESCE(SUM(s.amount), 0) as total_sold
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id
      GROUP BY sp.id, sp.name, sp.email
      ORDER BY total_sold DESC`,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json(
      rankings.map((r) => ({
        ...r,
        total_sold: parseFloat(r.total_sold) || 0,
      }))
    );
  } catch (error) {
    console.error('Error in getSalespersonRankings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get delinquent clients (top 10)
export const getDelinquentClients = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    let query = `SELECT 
      c.id,
      c.name,
      c.phone,
      c.email,
      c.salesperson_id,
      sp.name as salesperson_name,
      COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt,
      MAX(p.created_at) as last_payment_date
    FROM clients c
    LEFT JOIN salespeople sp ON c.salesperson_id = sp.id
    LEFT JOIN sales s ON c.id = s.client_id
    LEFT JOIN payments p ON c.id = p.client_id`;

    const replacements = {};

    if (salespersonId && salespersonId !== 'TODOS') {
      query += ` WHERE c.salesperson_id = :salespersonId`;
      replacements.salespersonId = salespersonId;
    }

    query += ` GROUP BY c.id, c.name, c.phone, c.email, c.salesperson_id, sp.id, sp.name
    HAVING (COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0)
      AND (MAX(p.created_at) IS NULL OR MAX(p.created_at) < NOW() - INTERVAL '60 days')
    ORDER BY debt DESC
    LIMIT 10`;

    const delinquent = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(
      delinquent.map((c) => ({
        ...c,
        debt: parseFloat(c.debt) || 0,
      }))
    );
  } catch (error) {
    console.error('Error in getDelinquentClients:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get sales opportunities (clients with debt < 75€)
export const getSalesOpportunities = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    let query = `SELECT 
      c.id,
      c.name,
      c.phone,
      c.email,
      c.salesperson_id,
      sp.name as salesperson_name,
      COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
    FROM clients c
    LEFT JOIN salespeople sp ON c.salesperson_id = sp.id
    LEFT JOIN sales s ON c.id = s.client_id
    LEFT JOIN payments p ON c.id = p.client_id`;

    const replacements = {};

    if (salespersonId && salespersonId !== 'TODOS') {
      query += ` WHERE c.salesperson_id = :salespersonId`;
      replacements.salespersonId = salespersonId;
    }

    query += ` GROUP BY c.id, c.name, c.phone, c.email, c.salesperson_id, sp.id, sp.name
    HAVING (COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) < 75)
    ORDER BY debt ASC`;

    const opportunities = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.json(
      opportunities.map((c) => ({
        ...c,
        debt: parseFloat(c.debt) || 0,
      }))
    );
  } catch (error) {
    console.error('Error in getSalesOpportunities:', error);
    res.status(500).json({ error: error.message });
  }
};