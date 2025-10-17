import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

// Get dashboard KPIs
export const getDashboardKPIs = async (req, res) => {
  try {
    const { salespersonId, dateFrom, dateTo } = req.query;
    
    // Construir filtros de fecha
    let dateFilter = '';
    let dateFilterPayments = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateTo';
      dateFilterPayments = 'AND p.created_at >= :dateFrom AND p.created_at <= :dateTo';
      replacements.dateFrom = dateFrom;
      replacements.dateTo = dateTo;
    } else {
      // Por defecto últimos 30 días
      dateFilter = 'AND s.created_at >= NOW() - INTERVAL \'30 days\'';
      dateFilterPayments = 'AND p.created_at >= NOW() - INTERVAL \'30 days\'';
    }
    
    // Filtro de vendedor
    let salespersonFilter = '';
    if (salespersonId && salespersonId !== 'TODOS') {
      salespersonFilter = 'AND c.salesperson_id = :salespersonId';
      replacements.salespersonId = salespersonId;
    }

    // Deuda total (sin filtro de fecha)
    const totalDebtQuery = `
      SELECT 
        COALESCE(SUM(s.amount), 0) as total_sales,
        COALESCE(SUM(p.amount), 0) as total_payments
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE 1=1 ${salespersonFilter.replace('AND', 'AND')}
    `;

    // Ventas del período
    const periodSalesQuery = `
      SELECT COALESCE(SUM(s.amount), 0) as total_sales
      FROM sales s
      LEFT JOIN clients c ON s.client_id = c.id
      WHERE 1=1 ${dateFilter} ${salespersonFilter}
    `;

    // Pagos del período
    const periodPaymentsQuery = `
      SELECT COALESCE(SUM(p.amount), 0) as total_payments
      FROM payments p
      LEFT JOIN clients c ON p.client_id = c.id
      WHERE 1=1 ${dateFilterPayments} ${salespersonFilter}
    `;

    const [totalDebtResult, periodSalesResult, periodPaymentsResult] = await Promise.all([
      sequelize.query(totalDebtQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(periodSalesQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(periodPaymentsQuery, { replacements, type: sequelize.QueryTypes.SELECT })
    ]);

    const totalSales = parseFloat(totalDebtResult[0]?.total_sales) || 0;
    const totalPayments = parseFloat(totalDebtResult[0]?.total_payments) || 0;
    const totalDebt = totalSales - totalPayments;
    const periodSales = parseFloat(periodSalesResult[0]?.total_sales) || 0;
    const periodPayments = parseFloat(periodPaymentsResult[0]?.total_payments) || 0;

    res.json({
      totalDebt,
      totalSalesLast30Days: periodSales,
      totalPaymentsLast30Days: periodPayments,
      periodLabel: dateFrom && dateTo ? `${dateFrom} al ${dateTo}` : 'Últimos 30 días'
    });
  } catch (error) {
    console.error('Error in getDashboardKPIs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get salesperson rankings
export const getSalespersonRankings = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Construir filtros de fecha
    let dateFilter = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateTo';
      replacements.dateFrom = dateFrom;
      replacements.dateTo = dateTo;
    }
    
    const rankings = await sequelize.query(
      `SELECT 
        sp.id,
        sp.name,
        sp.email,
        COALESCE(SUM(s.amount), 0) as total_sold
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id
      WHERE 1=1 ${dateFilter}
      GROUP BY sp.id, sp.name, sp.email
      ORDER BY total_sold DESC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
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

// Get collectors rankings (salespeople with most payments)
export const getCollectorsRankings = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    // Construir filtros de fecha
    let dateFilter = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND p.created_at >= :dateFrom AND p.created_at <= :dateTo';
      replacements.dateFrom = dateFrom;
      replacements.dateTo = dateTo;
    }
    
    const rankings = await sequelize.query(
      `SELECT 
        sp.id,
        sp.name,
        sp.email,
        COALESCE(SUM(p.amount), 0) as total_collected,
        COUNT(p.id) as payment_count
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE 1=1 ${dateFilter}
      GROUP BY sp.id, sp.name, sp.email
      ORDER BY total_collected DESC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.json(
      rankings.map((r) => ({
        ...r,
        total_collected: parseFloat(r.total_collected) || 0,
        payment_count: parseInt(r.payment_count) || 0,
      }))
    );
  } catch (error) {
    console.error('Error in getCollectorsRankings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get delinquent clients (top 10)
export const getDelinquentClients = async (req, res) => {
  try {
    const { salespersonId, dateFrom, dateTo } = req.query;
    
    // Construir filtro de período para pagos
    let paymentDateFilter = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      // Clientes que NO han pagado en el período especificado
      paymentDateFilter = `AND (MAX(p.created_at) IS NULL OR MAX(p.created_at) < :dateFrom)`;
      replacements.dateFrom = dateFrom;
    } else {
      // Por defecto: sin pagos en los últimos 60 días
      paymentDateFilter = `AND (MAX(p.created_at) IS NULL OR MAX(p.created_at) < NOW() - INTERVAL '60 days')`;
    }

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

    // Filtro de vendedor
    if (salespersonId && salespersonId !== 'TODOS') {
      query += ` WHERE c.salesperson_id = :salespersonId`;
      replacements.salespersonId = salespersonId;
    }

    query += ` GROUP BY c.id, c.name, c.phone, c.email, c.salesperson_id, sp.id, sp.name
    HAVING (COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0)
      ${paymentDateFilter}
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