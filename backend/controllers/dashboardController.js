import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment, HistoricalSale, HistoricalPayment } from '../models/index.js';

// Get dashboard KPIs
export const getDashboardKPIs = async (req, res) => {
  try {
    const { salespersonId, dateFrom, dateTo } = req.query;
    
    // Construir filtros de fecha
    let dateFilter = '';
    let dateFilterPayments = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateToEnd';
      dateFilterPayments = 'AND p.created_at >= :dateFrom AND p.created_at <= :dateToEnd';
      replacements.dateFrom = dateFrom;
      replacements.dateToEnd = dateTo + ' 23:59:59';
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
      dateFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateToEnd';
      replacements.dateFrom = dateFrom;
      replacements.dateToEnd = dateTo + ' 23:59:59';
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
      dateFilter = 'AND p.created_at >= :dateFrom AND p.created_at <= :dateToEnd';
      replacements.dateFrom = dateFrom;
      replacements.dateToEnd = dateTo + ' 23:59:59';
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

// Get historical analytics (pre-October 2025)
export const getHistoricalAnalytics = async (req, res) => {
  try {
    const { year, month, salespersonId } = req.query;
    
    // Construir filtros de fecha para datos históricos
    let dateFilter = '';
    let dateFilterPayments = '';
    let salespersonFilter = '';
    const replacements = {};
    
    if (year) {
      if (month) {
        dateFilter = `AND EXTRACT(YEAR FROM fechacom) = :year AND EXTRACT(MONTH FROM fechacom) = :month`;
        dateFilterPayments = `AND EXTRACT(YEAR FROM fecha_pago) = :year AND EXTRACT(MONTH FROM fecha_pago) = :month`;
        replacements.year = year;
        replacements.month = month;
      } else {
        dateFilter = `AND EXTRACT(YEAR FROM fechacom) = :year`;
        dateFilterPayments = `AND EXTRACT(YEAR FROM fecha_pago) = :year`;
        replacements.year = year;
      }
    }
    
    if (salespersonId && salespersonId !== 'TODOS') {
      // Limpiar el salespersonId si tiene caracteres extra
      let cleanSalespersonId = salespersonId;
      if (salespersonId.includes(':')) {
        // Si tiene formato UUID:numero, tomar solo el UUID
        cleanSalespersonId = salespersonId.split(':')[0];
      }
      
      // Si es un número (código legacy), convertirlo
      let finalSalespersonId = cleanSalespersonId;
      if (!isNaN(cleanSalespersonId) && cleanSalespersonId.trim() !== '') {
        finalSalespersonId = parseInt(cleanSalespersonId);
      } else {
        // Validar que sea un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(cleanSalespersonId)) {
          console.error('Invalid salespersonId format:', salespersonId, '-> cleaned:', cleanSalespersonId);
          return res.status(400).json({ error: `Invalid salespersonId format: ${salespersonId}` });
        }
        finalSalespersonId = cleanSalespersonId;
      }
      
      console.log('Applying salesperson filter:', finalSalespersonId, '(original:', salespersonId, ')');
      salespersonFilter = 'AND cod_user = :salespersonId';
      replacements.salespersonId = finalSalespersonId;
    }
    
    console.log('Filters applied:', { dateFilter, dateFilterPayments, salespersonFilter });
    
    // Obtener ventas históricas
    const historicalSalesQuery = `
      SELECT 
        EXTRACT(YEAR FROM fechacom) as year,
        EXTRACT(MONTH FROM fechacom) as month,
        COUNT(*) as total_transactions,
        SUM(total) as total_sales,
        AVG(total) as avg_sale,
        MIN(fechacom) as first_sale,
        MAX(fechacom) as last_sale
      FROM historical_sales
      WHERE 1=1 ${dateFilter} ${salespersonFilter}
      GROUP BY EXTRACT(YEAR FROM fechacom), EXTRACT(MONTH FROM fechacom)
      ORDER BY year DESC, month DESC
    `;
    
    // Obtener pagos históricos
    const historicalPaymentsQuery = `
      SELECT 
        EXTRACT(YEAR FROM fecha_pago) as year,
        EXTRACT(MONTH FROM fecha_pago) as month,
        COUNT(*) as total_payments,
        SUM(cantidad_pago) as total_collected,
        AVG(cantidad_pago) as avg_payment,
        MIN(fecha_pago) as first_payment,
        MAX(fecha_pago) as last_payment
      FROM historical_payments
        WHERE fecha_pago IS NOT NULL ${dateFilterPayments} ${salespersonFilter}
      GROUP BY EXTRACT(YEAR FROM fecha_pago), EXTRACT(MONTH FROM fecha_pago)
      ORDER BY year DESC, month DESC
    `;
    
    // Ranking de vendedores por ventas históricas
    const historicalSalespersonRankingsQuery = `
      SELECT 
        cod_user as salesperson_id,
        COUNT(*) as total_sales,
        SUM(total) as total_sold,
        AVG(total) as avg_sale,
        MIN(fechacom) as first_sale,
        MAX(fechacom) as last_sale
      FROM historical_sales
      WHERE 1=1 ${dateFilter} ${salespersonId && salespersonId !== 'TODOS' ? 'AND cod_user = :salespersonId' : ''}
      GROUP BY cod_user
      ORDER BY total_sold DESC
    `;
    
    // Ranking de cobradores por pagos históricos
    const historicalCollectorsRankingsQuery = `
      SELECT 
        cod_user as salesperson_id,
        COUNT(*) as total_payments,
        SUM(cantidad_pago) as total_collected,
        AVG(cantidad_pago) as avg_payment,
        MIN(fecha_pago) as first_payment,
        MAX(fecha_pago) as last_payment
      FROM historical_payments
      WHERE fecha_pago IS NOT NULL ${dateFilterPayments} ${salespersonId && salespersonId !== 'TODOS' ? 'AND cod_user = :salespersonId' : ''}
      GROUP BY cod_user
      ORDER BY total_collected DESC
    `;
    
    // Clientes morosos históricos
    const historicalDelinquentQuery = `
      SELECT 
        h.cod_cliente_p as client_id,
        h.nombre_c_p as name,
        h.apellidos_c_p as lastname,
        COUNT(*) as payment_count,
        SUM(h.cantidad_pago) as total_paid,
        MAX(h.fecha_pago) as last_payment,
        AVG(h.cantidad_pago) as avg_payment
      FROM historical_payments h
      WHERE fecha_pago IS NOT NULL ${dateFilterPayments} ${salespersonFilter}
      GROUP BY h.cod_cliente_p, h.nombre_c_p, h.apellidos_c_p
      HAVING MAX(h.fecha_pago) < CURRENT_DATE - INTERVAL '60 days'
      ORDER BY total_paid DESC
      LIMIT 10
    `;
    
    // Oportunidades históricas (clientes con poco gasto histórico)
    const historicalOpportunitiesQuery = `
      SELECT 
        s.nombrecli as name,
        s.apellidoscli as lastname,
        COUNT(*) as purchase_count,
        SUM(s.total) as total_spent,
        AVG(s.total) as avg_purchase,
        MAX(s.fechacom) as last_purchase
      FROM historical_sales s
      WHERE 1=1 ${dateFilter} ${salespersonFilter}
      GROUP BY s.nombrecli, s.apellidoscli
      HAVING SUM(s.total) < 50
      ORDER BY total_spent ASC
      LIMIT 10
    `;
    
    // Top clientes históricos por ventas
    const topCustomersQuery = `
      SELECT 
        nombrecli as customer_name,
        apellidoscli as customer_lastname,
        COUNT(*) as total_purchases,
        SUM(total) as total_spent,
        AVG(total) as avg_purchase,
        MIN(fechacom) as first_purchase,
        MAX(fechacom) as last_purchase
      FROM historical_sales
      WHERE 1=1 ${dateFilter} ${salespersonFilter}
      GROUP BY nombrecli, apellidoscli
      ORDER BY total_spent DESC
      LIMIT 10
    `;
    
    // Productos más vendidos
    const topProductsQuery = `
      SELECT 
        nombreart as product_name,
        COUNT(*) as times_sold,
        SUM(cantidad) as total_quantity,
        SUM(total) as total_revenue,
        AVG(precio) as avg_price
      FROM historical_sales
      WHERE 1=1 ${dateFilter} ${salespersonFilter}
      GROUP BY nombreart
      ORDER BY total_revenue DESC
      LIMIT 10
    `;
    
    const [salesData, paymentsData, salespersonRankings, collectorsRankings, delinquentData, opportunitiesData, topCustomers, topProducts] = await Promise.all([
      sequelize.query(historicalSalesQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(historicalPaymentsQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(historicalSalespersonRankingsQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(historicalCollectorsRankingsQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(historicalDelinquentQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(historicalOpportunitiesQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(topCustomersQuery, { replacements, type: sequelize.QueryTypes.SELECT }),
      sequelize.query(topProductsQuery, { replacements, type: sequelize.QueryTypes.SELECT })
    ]);
    
    // Calcular totales generales
    const totalSales = salesData.reduce((sum, item) => sum + parseFloat(item.total_sales || 0), 0);
    const totalPayments = paymentsData.reduce((sum, item) => sum + parseFloat(item.total_collected || 0), 0);
    
    res.json({
      // KPIs principales
      totalHistoricalSales: totalSales,
      totalHistoricalPayments: totalPayments,
      netHistoricalAmount: totalSales - totalPayments,
      
      // Resumen
      summary: {
        totalSales,
        totalPayments,
        netBalance: totalSales - totalPayments,
        periodLabel: year && month ? `${month}/${year}` : year ? `Año ${year}` : 'Datos Históricos Completos'
      },
      
      // Datos por período
      salesByPeriod: salesData.map(item => ({
        ...item,
        total_sales: parseFloat(item.total_sales || 0),
        avg_sale: parseFloat(item.avg_sale || 0)
      })),
      paymentsByPeriod: paymentsData.map(item => ({
        ...item,
        total_collected: parseFloat(item.total_collected || 0),
        avg_payment: parseFloat(item.avg_payment || 0)
      })),
      
      // Rankings de vendedores/cobradores
      salespersonRankings: salespersonRankings.map(item => ({
        ...item,
        total_sold: parseFloat(item.total_sold || 0),
        avg_sale: parseFloat(item.avg_sale || 0)
      })),
      collectorsRankings: collectorsRankings.map(item => ({
        ...item,
        total_collected: parseFloat(item.total_collected || 0),
        avg_payment: parseFloat(item.avg_payment || 0)
      })),
      
      // Clientes morosos y oportunidades
      delinquentClients: delinquentData.map(item => ({
        ...item,
        total_paid: parseFloat(item.total_paid || 0),
        avg_payment: parseFloat(item.avg_payment || 0),
        last_payment: item.last_payment
      })),
      salesOpportunities: opportunitiesData.map(item => ({
        ...item,
        total_spent: parseFloat(item.total_spent || 0),
        avg_purchase: parseFloat(item.avg_purchase || 0)
      })),
      
      // Top clientes y productos
      topCustomers: topCustomers.map(item => ({
        ...item,
        total_spent: parseFloat(item.total_spent || 0),
        avg_purchase: parseFloat(item.avg_purchase || 0)
      })),
      topProducts: topProducts.map(item => ({
        ...item,
        total_revenue: parseFloat(item.total_revenue || 0),
        avg_price: parseFloat(item.avg_price || 0)
      }))
    });
  } catch (error) {
    console.error('Error in getHistoricalAnalytics:', error);
    res.status(500).json({ error: error.message });
  }
};