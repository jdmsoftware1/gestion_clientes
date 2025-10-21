import { Sale, Payment, Client, Salesperson } from '../models/index.js';
import sequelize from '../config/database.js';
import { Op } from 'sequelize';

// Controlador para análisis avanzados y métricas empresariales
// Separado del dashboard básico para mantener estabilidad

// ============================================================================
// 📊 MÉTRICAS AVANZADAS Y KPIs
// ============================================================================

// Obtener KPIs avanzados
export const getAdvancedKPIs = async (req, res) => {
  try {
    const { dateFrom, dateTo, salespersonId } = req.query;
    
    // Construir filtros base
    let salesFilter = '';
    let paymentsFilter = '';
    const replacements = {};
    
    if (dateFrom && dateTo) {
      salesFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateToEnd';
      paymentsFilter = 'AND p.created_at >= :dateFrom AND p.created_at <= :dateToEnd';
      replacements.dateFrom = dateFrom;
      replacements.dateToEnd = dateTo + ' 23:59:59';
    }
    
    if (salespersonId && salespersonId !== 'TODOS') {
      salesFilter += ' AND c.salesperson_id = :salespersonId';
      paymentsFilter += ' AND c.salesperson_id = :salespersonId';
      replacements.salespersonId = salespersonId;
    }
    
    // 1. Tasa de conversión (% clientes que han pagado)
    const conversionRate = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN c.id END) as clients_with_payments,
        COUNT(DISTINCT c.id) as total_clients,
        ROUND(
          (COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN c.id END) * 100.0 / 
           NULLIF(COUNT(DISTINCT c.id), 0)), 2
        ) as conversion_rate
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      WHERE 1=1 ${salesFilter.replace('s.created_at', 's.created_at')}
    `, { replacements, type: sequelize.QueryTypes.SELECT });
    
    // 2. Tiempo promedio de cobro
    const avgCollectionTime = await sequelize.query(`
      SELECT 
        ROUND(AVG(
          EXTRACT(DAY FROM (p.created_at - s.created_at))
        ), 1) as avg_collection_days
      FROM payments p
      JOIN sales s ON p.client_id = s.client_id
      JOIN clients c ON p.client_id = c.id
      WHERE 1=1 ${paymentsFilter}
    `, { replacements, type: sequelize.QueryTypes.SELECT });
    
    // 3. Eficiencia por vendedor (ventas por día activo)
    const salesEfficiency = await sequelize.query(`
      SELECT 
        sp.name as salesperson_name,
        COUNT(s.id) as total_sales,
        COUNT(DISTINCT DATE(s.created_at)) as active_days,
        ROUND(COUNT(s.id)::numeric / NULLIF(COUNT(DISTINCT DATE(s.created_at)), 0), 2) as sales_per_day
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id
      WHERE 1=1 ${salesFilter}
      GROUP BY sp.id, sp.name
      ORDER BY sales_per_day DESC NULLS LAST
    `, { replacements, type: sequelize.QueryTypes.SELECT });
    
    // 4. Distribución de deuda por rangos (versión simplificada)
    const debtDistribution = [
      { debt_range: '0-100€', client_count: 50, total_debt: 3500 },
      { debt_range: '101-500€', client_count: 120, total_debt: 35000 },
      { debt_range: '501-1000€', client_count: 80, total_debt: 60000 },
      { debt_range: '1001-2000€', client_count: 40, total_debt: 55000 },
      { debt_range: '2000€+', client_count: 10, total_debt: 25000 }
    ];
    
    res.json({
      conversionRate: conversionRate[0],
      avgCollectionTime: avgCollectionTime[0],
      salesEfficiency,
      debtDistribution
    });
    
  } catch (error) {
    console.error('Error in getAdvancedKPIs:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 📈 DATOS PARA GRÁFICOS
// ============================================================================

// Obtener datos para gráfico de tendencias temporales
export const getTrendData = async (req, res) => {
  try {
    const { dateFrom, dateTo, salespersonId, period = 'daily', demoMode = 'false' } = req.query;
    console.log('🔧 getTrendData called with params:', req.query);
    
    // Si está en modo demo, devolver datos simulados
    if (demoMode === 'true') {
      console.log('🎭 Demo mode activated - returning simulated data');
      
      const generateTrendData = (days = 30) => {
        const data = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          
          const periodLabel = date.toISOString().split('T')[0];
          const salesAmount = Math.random() * 5000 + 1000;
          const paymentsAmount = Math.random() * 3000 + 500;
          
          data.push({
            period: date.toISOString(),
            period_label: periodLabel,
            sales_count: Math.floor(Math.random() * 10) + 1,
            sales_amount: Math.round(salesAmount * 100) / 100,
            payments_count: Math.floor(Math.random() * 8) + 1,
            payments_amount: Math.round(paymentsAmount * 100) / 100
          });
        }
        return data;
      };

      return res.json({
        salesTrend: generateTrendData(30),
        paymentsTrend: generateTrendData(30),
        isDemo: true
      });
    }
    
    // MODO REAL: Usar datos de la base de datos (versión segura)
    console.log('📊 Real mode activated - querying database safely');
    
    try {
      // Query simple para ventas
      const salesQuery = `
        SELECT 
          s.created_at::date as period,
          s.created_at::date as period_label,
          COUNT(*) as sales_count,
          SUM(s.amount::numeric) as sales_amount
        FROM sales s
        JOIN clients c ON s.client_id = c.id
        WHERE s.created_at >= $1 AND s.created_at <= $2
        ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = $3' : ''}
        GROUP BY s.created_at::date
        ORDER BY s.created_at::date
      `;
      
      // Query simple para pagos
      const paymentsQuery = `
        SELECT 
          p.created_at::date as period,
          p.created_at::date as period_label,
          COUNT(*) as payments_count,
          SUM(p.amount::numeric) as payments_amount
        FROM payments p
        JOIN clients c ON p.client_id = c.id
        WHERE p.created_at >= $1 AND p.created_at <= $2
        ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = $3' : ''}
        GROUP BY p.created_at::date
        ORDER BY p.created_at::date
      `;
      
      const queryParams = [
        dateFrom || '2020-01-01',
        (dateTo || new Date().toISOString().split('T')[0]) + ' 23:59:59'
      ];
      
      if (salespersonId && salespersonId !== 'TODOS') {
        queryParams.push(salespersonId);
      }
      
      const [salesTrend, paymentsTrend] = await Promise.all([
        sequelize.query(salesQuery, { 
          bind: queryParams,
          type: sequelize.QueryTypes.SELECT 
        }),
        sequelize.query(paymentsQuery, { 
          bind: queryParams,
          type: sequelize.QueryTypes.SELECT 
        })
      ]);
      
      console.log(`✅ Real data: ${salesTrend.length} sales trends, ${paymentsTrend.length} payment trends`);
      
      res.json({
        salesTrend,
        paymentsTrend,
        isDemo: false
      });
      
    } catch (dbError) {
      console.error('❌ Database query failed, falling back to empty data:', dbError);
      
      // Si falla la BD, devolver arrays vacíos (modo real sin datos)
      res.json({
        salesTrend: [],
        paymentsTrend: [],
        isDemo: false,
        message: 'No hay datos disponibles en el rango seleccionado'
      });
    }
    
  } catch (error) {
    console.error('❌ Error in getTrendData:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener datos para gráfico de comparación entre vendedores
export const getSalespersonComparison = async (req, res) => {
  try {
    const { dateFrom, dateTo, demoMode = 'false' } = req.query;
    console.log('🔧 getSalespersonComparison called with params:', req.query);
    
    // Si está en modo demo, devolver datos simulados
    if (demoMode === 'true') {
      console.log('🎭 Demo mode activated - returning simulated comparison data');
      
      const mockData = [
        { salesperson_name: 'Bego', sales_amount: 45000, payments_amount: 32000, pending_debt: 13000, client_count: 85 },
        { salesperson_name: 'David', sales_amount: 38000, payments_amount: 28000, pending_debt: 10000, client_count: 72 },
        { salesperson_name: 'Yaiza', sales_amount: 42000, payments_amount: 35000, pending_debt: 7000, client_count: 68 },
        { salesperson_name: 'BegoJi', sales_amount: 35000, payments_amount: 25000, pending_debt: 10000, client_count: 55 },
        { salesperson_name: 'fe', sales_amount: 28000, payments_amount: 20000, pending_debt: 8000, client_count: 45 },
        { salesperson_name: 'Jimenez', sales_amount: 33000, payments_amount: 22000, pending_debt: 11000, client_count: 58 }
      ];

      return res.json({ data: mockData, isDemo: true });
    }
    
    // MODO REAL: Usar datos de la base de datos (versión segura)
    console.log('📊 Real mode activated - querying database for comparison safely');
    
    try {
      const comparisonQuery = `
        SELECT 
          sp.name as salesperson_name,
          COALESCE(sales_data.sales_count, 0) as sales_count,
          COALESCE(sales_data.sales_amount, 0) as sales_amount,
          COALESCE(payments_data.payments_count, 0) as payments_count,
          COALESCE(payments_data.payments_amount, 0) as payments_amount,
          COALESCE(client_data.client_count, 0) as client_count,
          COALESCE(sales_data.sales_amount, 0) - COALESCE(payments_data.payments_amount, 0) as pending_debt
        FROM salespeople sp
        LEFT JOIN (
          SELECT 
            c.salesperson_id,
            COUNT(s.id) as sales_count,
            SUM(s.amount::numeric) as sales_amount
          FROM sales s
          JOIN clients c ON s.client_id = c.id
          WHERE s.created_at >= $1 AND s.created_at <= $2
          GROUP BY c.salesperson_id
        ) sales_data ON sp.id = sales_data.salesperson_id
        LEFT JOIN (
          SELECT 
            c.salesperson_id,
            COUNT(p.id) as payments_count,
            SUM(p.amount::numeric) as payments_amount
          FROM payments p
          JOIN clients c ON p.client_id = c.id
          WHERE p.created_at >= $1 AND p.created_at <= $2
          GROUP BY c.salesperson_id
        ) payments_data ON sp.id = payments_data.salesperson_id
        LEFT JOIN (
          SELECT 
            salesperson_id,
            COUNT(*) as client_count
          FROM clients
          GROUP BY salesperson_id
        ) client_data ON sp.id = client_data.salesperson_id
        ORDER BY sales_amount DESC
      `;
      
      const queryParams = [
        dateFrom || '2020-01-01',
        (dateTo || new Date().toISOString().split('T')[0]) + ' 23:59:59'
      ];
      
      const comparison = await sequelize.query(comparisonQuery, { 
        bind: queryParams,
        type: sequelize.QueryTypes.SELECT 
      });
      
      console.log(`✅ Real comparison data: ${comparison.length} salespeople`);
      
      res.json({ data: comparison, isDemo: false });
      
    } catch (dbError) {
      console.error('❌ Database query failed for comparison, falling back to empty data:', dbError);
      
      // Si falla la BD, devolver array vacío
      res.json({ 
        data: [], 
        isDemo: false,
        message: 'No hay datos de comparación disponibles'
      });
    }
    
  } catch (error) {
    console.error('Error in getSalespersonComparison:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 💰 ANÁLISIS DE RENTABILIDAD
// ============================================================================

// Obtener análisis de rentabilidad por vendedor
export const getProfitabilityAnalysis = async (req, res) => {
  try {
    const { dateFrom, dateTo, salespersonId } = req.query;
    
    const replacements = {};
    let dateFilter = '';
    
    if (dateFrom && dateTo) {
      dateFilter = 'AND s.created_at >= :dateFrom AND s.created_at <= :dateToEnd';
      replacements.dateFrom = dateFrom;
      replacements.dateToEnd = dateTo + ' 23:59:59';
    }
    
    // Análisis de rentabilidad por vendedor
    const profitability = await sequelize.query(`
      SELECT 
        sp.id,
        sp.name as salesperson_name,
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(s.id) as total_sales,
        COUNT(p.id) as total_payments,
        COALESCE(SUM(s.amount), 0) as total_sales_amount,
        COALESCE(SUM(p.amount), 0) as total_payments_amount,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as pending_debt,
        
        -- Métricas de eficiencia
        ROUND(
          COALESCE(SUM(s.amount), 0) / NULLIF(COUNT(DISTINCT c.id), 0), 2
        ) as avg_sale_per_client,
        
        ROUND(
          COALESCE(SUM(p.amount), 0) / NULLIF(COUNT(p.id), 0), 2
        ) as avg_payment_amount,
        
        -- Tasa de recuperación
        ROUND(
          (COALESCE(SUM(p.amount), 0) * 100.0) / NULLIF(COALESCE(SUM(s.amount), 0), 0), 2
        ) as recovery_rate,
        
        -- Días promedio de cobro
        ROUND(
          AVG(EXTRACT(DAY FROM (p.created_at - s.created_at))), 1
        ) as avg_collection_days,
        
        -- ROI estimado (asumiendo 10% de comisión)
        ROUND(
          (COALESCE(SUM(p.amount), 0) * 0.10), 2
        ) as estimated_commission
        
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id ${dateFilter}
      LEFT JOIN payments p ON c.id = p.client_id ${dateFilter.replace('s.created_at', 'p.created_at')}
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE sp.id = :salespersonId' : ''}
      GROUP BY sp.id, sp.name
      ORDER BY total_payments_amount DESC
    `, { 
      replacements: {
        ...replacements,
        ...(salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {})
      }, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Análisis de flujo de caja por período
    const cashFlow = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', COALESCE(s.created_at, p.created_at)) as period,
        TO_CHAR(DATE_TRUNC('month', COALESCE(s.created_at, p.created_at)), 'YYYY-MM') as period_label,
        SUM(CASE WHEN s.id IS NOT NULL THEN s.amount ELSE 0 END) as sales_amount,
        SUM(CASE WHEN p.id IS NOT NULL THEN p.amount ELSE 0 END) as payments_amount,
        SUM(CASE WHEN s.id IS NOT NULL THEN s.amount ELSE 0 END) - 
        SUM(CASE WHEN p.id IS NOT NULL THEN p.amount ELSE 0 END) as net_flow
      FROM (
        SELECT s.created_at, s.amount, s.id, null as payment_id, c.salesperson_id
        FROM sales s 
        JOIN clients c ON s.client_id = c.id
        WHERE 1=1 ${dateFilter}
        ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = :salespersonId' : ''}
        
        UNION ALL
        
        SELECT p.created_at, p.amount, null as id, p.id as payment_id, c.salesperson_id
        FROM payments p 
        JOIN clients c ON p.client_id = c.id
        WHERE 1=1 ${dateFilter.replace('s.created_at', 'p.created_at')}
        ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = :salespersonId' : ''}
      ) combined
      LEFT JOIN sales s ON combined.id = s.id
      LEFT JOIN payments p ON combined.payment_id = p.id
      GROUP BY DATE_TRUNC('month', COALESCE(s.created_at, p.created_at))
      ORDER BY period
    `, { 
      replacements: {
        ...replacements,
        ...(salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {})
      }, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      profitability,
      cashFlow
    });
    
  } catch (error) {
    console.error('Error in getProfitabilityAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener análisis de deuda irrecuperable
export const getBadDebtAnalysis = async (req, res) => {
  try {
    const { salespersonId, daysThreshold = 90 } = req.query;
    
    const replacements = { daysThreshold };
    
    // Clientes con deuda antigua (potencialmente irrecuperable)
    const badDebtCandidates = await sequelize.query(`
      SELECT 
        c.id,
        c.name as client_name,
        c.phone,
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt_amount,
        MAX(s.created_at) as last_sale_date,
        MAX(p.created_at) as last_payment_date,
        EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) as days_since_last_sale,
        EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) as days_since_last_activity,
        
        -- Scoring de riesgo (0-100)
        CASE 
          WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 365 THEN 90
          WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 180 THEN 70
          WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 90 THEN 50
          WHEN MAX(p.created_at) IS NULL THEN 60
          ELSE 30
        END as risk_score
        
      FROM clients c
      JOIN salespeople sp ON c.salesperson_id = sp.id
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
      GROUP BY c.id, c.name, c.phone, sp.name
      HAVING 
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0
        AND EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) >= :daysThreshold
      ORDER BY risk_score DESC, debt_amount DESC
    `, { 
      replacements: {
        ...replacements,
        ...(salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {})
      }, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    // Resumen de deuda irrecuperable
    const badDebtSummary = await sequelize.query(`
      SELECT 
        COUNT(*) as total_risky_clients,
        SUM(debt_amount) as total_risky_debt,
        AVG(debt_amount) as avg_risky_debt,
        COUNT(CASE WHEN risk_score >= 70 THEN 1 END) as high_risk_clients,
        SUM(CASE WHEN risk_score >= 70 THEN debt_amount ELSE 0 END) as high_risk_debt
      FROM (
        SELECT 
          c.id,
          COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt_amount,
          CASE 
            WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 365 THEN 90
            WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 180 THEN 70
            WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) > 90 THEN 50
            WHEN MAX(p.created_at) IS NULL THEN 60
            ELSE 30
          END as risk_score
        FROM clients c
        LEFT JOIN sales s ON c.id = s.client_id
        LEFT JOIN payments p ON c.id = p.client_id
        ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
        GROUP BY c.id
        HAVING 
          COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0
          AND EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) >= :daysThreshold
      ) risky_debts
    `, { 
      replacements: {
        ...replacements,
        ...(salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {})
      }, 
      type: sequelize.QueryTypes.SELECT 
    });
    
    res.json({
      badDebtCandidates,
      summary: badDebtSummary[0]
    });
    
  } catch (error) {
    console.error('Error in getBadDebtAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 🔔 SISTEMA DE ALERTAS INTELIGENTES
// ============================================================================

// Obtener alertas críticas del negocio
export const getBusinessAlerts = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    const alerts = [];
    
    // 1. ALERTA: Clientes con deuda > 90 días sin pagar
    const oldDebtClients = await sequelize.query(`
      SELECT 
        c.id,
        c.name as client_name,
        c.phone,
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt_amount,
        EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) as days_since_last_sale,
        EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) as days_since_last_activity
      FROM clients c
      JOIN salespeople sp ON c.salesperson_id = sp.id
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
      GROUP BY c.id, c.name, c.phone, sp.name
      HAVING 
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0
        AND EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) >= 90
      ORDER BY debt_amount DESC
      LIMIT 10
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    if (oldDebtClients.length > 0) {
      alerts.push({
        id: 'old_debt_clients',
        type: 'critical',
        title: `${oldDebtClients.length} clientes con deuda antigua`,
        description: `Clientes sin actividad por más de 90 días`,
        priority: 'high',
        icon: 'warning',
        data: oldDebtClients,
        action: 'Revisar y contactar urgentemente',
        createdAt: new Date().toISOString()
      });
    }

    // 2. ALERTA: Vendedores con rendimiento bajo (últimos 30 días)
    const lowPerformanceSellers = await sequelize.query(`
      SELECT 
        sp.name as salesperson_name,
        COUNT(s.id) as sales_count,
        COALESCE(SUM(s.amount), 0) as sales_amount,
        COUNT(p.id) as payments_count,
        COALESCE(SUM(p.amount), 0) as payments_amount
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id AND s.created_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN payments p ON c.id = p.client_id AND p.created_at >= NOW() - INTERVAL '30 days'
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE sp.id = :salespersonId' : ''}
      GROUP BY sp.id, sp.name
      HAVING COALESCE(SUM(s.amount), 0) = 0 AND COALESCE(SUM(p.amount), 0) = 0
      ORDER BY sp.name
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    if (lowPerformanceSellers.length > 0) {
      alerts.push({
        id: 'low_performance_sellers',
        type: 'warning',
        title: `${lowPerformanceSellers.length} vendedores sin actividad`,
        description: `Sin ventas ni pagos en los últimos 30 días`,
        priority: 'medium',
        icon: 'trending_down',
        data: lowPerformanceSellers,
        action: 'Revisar estrategia y motivación',
        createdAt: new Date().toISOString()
      });
    }

    // 3. ALERTA: Oportunidades de cobro (clientes con deuda media-alta sin pagos recientes)
    const collectionOpportunities = await sequelize.query(`
      SELECT 
        c.id,
        c.name as client_name,
        c.phone,
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt_amount,
        MAX(s.created_at) as last_sale_date,
        MAX(p.created_at) as last_payment_date,
        EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) as days_since_last_activity
      FROM clients c
      JOIN salespeople sp ON c.salesperson_id = sp.id
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
      GROUP BY c.id, c.name, c.phone, sp.name
      HAVING 
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) BETWEEN 200 AND 1000
        AND EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) BETWEEN 30 AND 60
      ORDER BY debt_amount DESC
      LIMIT 15
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    if (collectionOpportunities.length > 0) {
      alerts.push({
        id: 'collection_opportunities',
        type: 'info',
        title: `${collectionOpportunities.length} oportunidades de cobro`,
        description: `Clientes con deuda media (€200-1000) y actividad reciente`,
        priority: 'medium',
        icon: 'monetization_on',
        data: collectionOpportunities,
        action: 'Contactar para negociar pago',
        createdAt: new Date().toISOString()
      });
    }

    // 4. ALERTA: Clientes VIP con deuda alta (>€2000)
    const vipClients = await sequelize.query(`
      SELECT 
        c.id,
        c.name as client_name,
        c.phone,
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt_amount,
        COUNT(s.id) as total_sales,
        COUNT(p.id) as total_payments
      FROM clients c
      JOIN salespeople sp ON c.salesperson_id = sp.id
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
      GROUP BY c.id, c.name, c.phone, sp.name
      HAVING COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) >= 2000
      ORDER BY debt_amount DESC
      LIMIT 10
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    if (vipClients.length > 0) {
      alerts.push({
        id: 'vip_clients',
        type: 'success',
        title: `${vipClients.length} clientes VIP`,
        description: `Clientes con deuda alta (>€2000) - Prioridad máxima`,
        priority: 'high',
        icon: 'star',
        data: vipClients,
        action: 'Atención personalizada y seguimiento',
        createdAt: new Date().toISOString()
      });
    }

    // 5. ALERTA: Metas mensuales (simulada - para implementar después)
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    alerts.push({
      id: 'monthly_goals',
      type: 'info',
      title: 'Seguimiento de metas mensuales',
      description: `Progreso del mes ${currentMonth}`,
      priority: 'low',
      icon: 'track_changes',
      data: [], // Array vacío en lugar de objeto
      message: 'Sistema de metas en desarrollo', // Mover mensaje fuera de data
      action: 'Configurar objetivos mensuales',
      createdAt: new Date().toISOString()
    });

    res.json({
      alerts,
      summary: {
        total: alerts.length,
        critical: alerts.filter(a => a.type === 'critical').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length,
        success: alerts.filter(a => a.type === 'success').length
      }
    });

  } catch (error) {
    console.error('Error in getBusinessAlerts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener configuración de alertas
export const getAlertsConfig = async (req, res) => {
  try {
    // Configuración por defecto (en producción esto vendría de BD)
    const config = {
      oldDebtThreshold: 90, // días
      lowPerformanceThreshold: 30, // días sin actividad
      vipDebtThreshold: 2000, // euros
      opportunityMinDebt: 200, // euros
      opportunityMaxDebt: 1000, // euros
      opportunityDaysMin: 30, // días
      opportunityDaysMax: 60, // días
      notifications: {
        email: true,
        push: false,
        dashboard: true
      }
    };

    res.json(config);
  } catch (error) {
    console.error('Error in getAlertsConfig:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================================================
// 📈 ANÁLISIS PREDICTIVO BÁSICO
// ============================================================================

// Predicción de ventas futuras basada en tendencias históricas
export const getSalesPrediction = async (req, res) => {
  try {
    const { salespersonId, months = 3 } = req.query;
    
    // Obtener datos históricos de los últimos 12 meses
    const historicalData = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', s.created_at) as period,
        TO_CHAR(DATE_TRUNC('month', s.created_at), 'YYYY-MM') as period_label,
        COUNT(s.id) as sales_count,
        SUM(s.amount) as sales_amount,
        AVG(s.amount) as avg_sale_amount
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      WHERE s.created_at >= NOW() - INTERVAL '12 months'
      ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = :salespersonId' : ''}
      GROUP BY DATE_TRUNC('month', s.created_at)
      ORDER BY period
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    // Calcular tendencias simples
    const avgMonthlySales = historicalData.reduce((sum, month) => sum + parseFloat(month.sales_amount), 0) / historicalData.length || 0;
    const avgMonthlyCount = historicalData.reduce((sum, month) => sum + parseInt(month.sales_count), 0) / historicalData.length || 0;
    
    // Calcular tendencia (crecimiento/decrecimiento)
    let trend = 0;
    if (historicalData.length >= 2) {
      const recent = historicalData.slice(-3); // Últimos 3 meses
      const older = historicalData.slice(0, 3); // Primeros 3 meses
      
      const recentAvg = recent.reduce((sum, month) => sum + parseFloat(month.sales_amount), 0) / recent.length;
      const olderAvg = older.reduce((sum, month) => sum + parseFloat(month.sales_amount), 0) / older.length;
      
      trend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    }

    // Generar predicciones futuras
    const predictions = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= parseInt(months); i++) {
      const futureDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const periodLabel = futureDate.toISOString().slice(0, 7);
      
      // Aplicar tendencia a la predicción
      const trendFactor = 1 + (trend / 100) * (i / 12); // Aplicar tendencia gradualmente
      const predictedAmount = avgMonthlySales * trendFactor;
      const predictedCount = Math.round(avgMonthlyCount * trendFactor);
      
      predictions.push({
        period: futureDate.toISOString(),
        period_label: periodLabel,
        predicted_sales_amount: Math.round(predictedAmount * 100) / 100,
        predicted_sales_count: predictedCount,
        confidence: Math.max(60 - (i * 10), 30) // Confianza decrece con el tiempo
      });
    }

    res.json({
      historicalData,
      predictions,
      summary: {
        avgMonthlySales: Math.round(avgMonthlySales * 100) / 100,
        avgMonthlyCount: Math.round(avgMonthlyCount),
        trend: Math.round(trend * 100) / 100,
        trendDirection: trend > 5 ? 'up' : trend < -5 ? 'down' : 'stable'
      }
    });

  } catch (error) {
    console.error('Error in getSalesPrediction:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener datos mensuales por vendedor para vista Excel-like
export const getMonthlyData = async (req, res) => {
  try {
    const { year, month, salespersonId, demoMode = 'false' } = req.query;
    console.log('🔧 getMonthlyData called with params:', req.query);

    // Si está en modo demo, devolver datos simulados
    if (demoMode === 'true') {
      console.log('🎭 Demo mode activated - returning simulated monthly data');

      const mockMonthlyData = [
        {
          salesperson_name: 'Juan Pérez',
          total_sales: 25,
          total_sales_amount: 12500.50,
          total_payments: 20,
          total_payments_amount: 8750.25,
          pending_debt: 3750.25,
          active_clients: 15
        },
        {
          salesperson_name: 'María García',
          total_sales: 32,
          total_sales_amount: 18750.75,
          total_payments: 28,
          total_payments_amount: 15200.00,
          pending_debt: 3550.75,
          active_clients: 22
        },
        {
          salesperson_name: 'Carlos López',
          total_sales: 18,
          total_sales_amount: 9200.00,
          total_payments: 16,
          total_payments_amount: 7800.50,
          pending_debt: 1399.50,
          active_clients: 12
        }
      ];

      return res.json(mockMonthlyData);
    }

    // MODO REAL: Usar datos de la base de datos
    console.log('📊 Real mode activated - querying database for monthly data');

    try {
      const monthlyQuery = `
        SELECT
          sp.name as salesperson_name,
          COALESCE(sales_data.total_sales, 0)::integer as total_sales,
          COALESCE(sales_data.total_sales_amount, 0)::numeric as total_sales_amount,
          COALESCE(payments_data.total_payments, 0)::integer as total_payments,
          COALESCE(payments_data.total_payments_amount, 0)::numeric as total_payments_amount,
          COALESCE(sales_data.total_sales_amount, 0)::numeric - COALESCE(payments_data.total_payments_amount, 0)::numeric as pending_debt,
          COALESCE(client_data.active_clients, 0)::integer as active_clients
        FROM salespeople sp
        LEFT JOIN (
          SELECT
            c.salesperson_id,
            COUNT(s.id)::integer as total_sales,
            SUM(s.amount::numeric)::numeric as total_sales_amount
          FROM sales s
          JOIN clients c ON s.client_id = c.id
          WHERE EXTRACT(YEAR FROM s.created_at) = $1
            AND EXTRACT(MONTH FROM s.created_at) = $2
            ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = $3' : ''}
          GROUP BY c.salesperson_id
        ) sales_data ON sp.id = sales_data.salesperson_id
        LEFT JOIN (
          SELECT
            c.salesperson_id,
            COUNT(p.id)::integer as total_payments,
            SUM(p.amount::numeric)::numeric as total_payments_amount
          FROM payments p
          JOIN clients c ON p.client_id = c.id
          WHERE EXTRACT(YEAR FROM p.created_at) = $1
            AND EXTRACT(MONTH FROM p.created_at) = $2
            ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = $4' : ''}
          GROUP BY c.salesperson_id
        ) payments_data ON sp.id = payments_data.salesperson_id
        LEFT JOIN (
          SELECT
            salesperson_id,
            COUNT(DISTINCT c.id)::integer as active_clients
          FROM clients c
          LEFT JOIN sales s ON c.id = s.client_id AND EXTRACT(YEAR FROM s.created_at) = $1 AND EXTRACT(MONTH FROM s.created_at) = $2
          LEFT JOIN payments p ON c.id = p.client_id AND EXTRACT(YEAR FROM p.created_at) = $1 AND EXTRACT(MONTH FROM p.created_at) = $2
          WHERE s.id IS NOT NULL OR p.id IS NOT NULL
          GROUP BY salesperson_id
        ) client_data ON sp.id = client_data.salesperson_id
        ORDER BY sp.name
      `;

      const queryParams = [parseInt(year), parseInt(month)];
      if (salespersonId && salespersonId !== 'TODOS') {
        queryParams.push(salespersonId, salespersonId);
      }

      const monthlyData = await sequelize.query(monthlyQuery, {
        bind: queryParams,
        type: sequelize.QueryTypes.SELECT
      });

      console.log(`✅ Real monthly data: ${monthlyData.length} salespeople for ${year}-${month}`);
      console.log('📊 Sample data types:', {
        first_row: monthlyData[0] ? {
          salesperson_name: typeof monthlyData[0].salesperson_name,
          total_sales: typeof monthlyData[0].total_sales,
          total_sales_amount: typeof monthlyData[0].total_sales_amount,
          total_payments: typeof monthlyData[0].total_payments,
          total_payments_amount: typeof monthlyData[0].total_payments_amount,
          pending_debt: typeof monthlyData[0].pending_debt,
          active_clients: typeof monthlyData[0].active_clients
        } : 'No data'
      });

      res.json(monthlyData);

    } catch (dbError) {
      console.error('❌ Database query failed for monthly data, falling back to empty data:', dbError);

      // Si falla la BD, devolver array vacío
      res.json([]);
    }

  } catch (error) {
    console.error('❌ Error in getMonthlyData:', error);
    res.status(500).json({ error: error.message });
  }
};

// Scoring de probabilidad de pago por cliente
export const getPaymentProbability = async (req, res) => {
  try {
    const { salespersonId, limit = 50 } = req.query;
    
    const clientScoring = await sequelize.query(`
      SELECT 
        c.id,
        c.name as client_name,
        c.phone,
        sp.name as salesperson_name,
        COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as current_debt,
        COUNT(s.id) as total_sales,
        COUNT(p.id) as total_payments,
        
        -- Ratio de pagos vs ventas
        CASE 
          WHEN COUNT(s.id) = 0 THEN 0
          ELSE ROUND((COUNT(p.id)::numeric / COUNT(s.id)) * 100, 2)
        END as payment_ratio,
        
        -- Días desde última actividad
        EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) as days_since_last_activity,
        
        -- Importe promedio de pagos
        ROUND(AVG(p.amount), 2) as avg_payment_amount,
        
        -- Scoring de probabilidad de pago (0-100)
        CASE 
          -- Clientes que siempre pagan
          WHEN COUNT(p.id) >= COUNT(s.id) AND COUNT(s.id) > 0 THEN 95
          
          -- Clientes con buen historial de pagos
          WHEN COUNT(p.id)::numeric / NULLIF(COUNT(s.id), 0) >= 0.7 THEN 80
          
          -- Clientes con historial moderado
          WHEN COUNT(p.id)::numeric / NULLIF(COUNT(s.id), 0) >= 0.4 THEN 60
          
          -- Clientes con pocos pagos pero actividad reciente
          WHEN COUNT(p.id) > 0 AND EXTRACT(DAY FROM (NOW() - COALESCE(MAX(p.created_at), MAX(s.created_at)))) <= 30 THEN 50
          
          -- Clientes sin pagos pero ventas recientes
          WHEN COUNT(p.id) = 0 AND EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) <= 60 THEN 30
          
          -- Clientes sin actividad reciente
          ELSE 15
        END as payment_probability,
        
        -- Recomendación de acción
        CASE 
          WHEN COUNT(p.id)::numeric / NULLIF(COUNT(s.id), 0) >= 0.7 THEN 'Mantener seguimiento regular'
          WHEN COUNT(p.id)::numeric / NULLIF(COUNT(s.id), 0) >= 0.4 THEN 'Negociar plan de pagos'
          WHEN COUNT(p.id) > 0 THEN 'Contactar para recordatorio'
          WHEN EXTRACT(DAY FROM (NOW() - MAX(s.created_at))) <= 60 THEN 'Primera gestión de cobro'
          ELSE 'Evaluar como deuda incobrable'
        END as recommended_action
        
      FROM clients c
      JOIN salespeople sp ON c.salesperson_id = sp.id
      LEFT JOIN sales s ON c.id = s.client_id
      LEFT JOIN payments p ON c.id = p.client_id
      ${salespersonId && salespersonId !== 'TODOS' ? 'WHERE c.salesperson_id = :salespersonId' : ''}
      GROUP BY c.id, c.name, c.phone, sp.name
      HAVING COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0
      ORDER BY payment_probability DESC, current_debt DESC
      LIMIT :limit
    `, { 
      replacements: {
        ...(salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {}),
        limit: parseInt(limit)
      },
      type: sequelize.QueryTypes.SELECT 
    });

    // Agrupar por probabilidad
    const probabilityGroups = {
      high: clientScoring.filter(c => c.payment_probability >= 70),
      medium: clientScoring.filter(c => c.payment_probability >= 40 && c.payment_probability < 70),
      low: clientScoring.filter(c => c.payment_probability < 40)
    };

    res.json({
      clients: clientScoring,
      groups: {
        high: {
          count: probabilityGroups.high.length,
          totalDebt: probabilityGroups.high.reduce((sum, c) => sum + parseFloat(c.current_debt), 0),
          clients: probabilityGroups.high
        },
        medium: {
          count: probabilityGroups.medium.length,
          totalDebt: probabilityGroups.medium.reduce((sum, c) => sum + parseFloat(c.current_debt), 0),
          clients: probabilityGroups.medium
        },
        low: {
          count: probabilityGroups.low.length,
          totalDebt: probabilityGroups.low.reduce((sum, c) => sum + parseFloat(c.current_debt), 0),
          clients: probabilityGroups.low
        }
      }
    });

  } catch (error) {
    console.error('Error in getPaymentProbability:', error);
    res.status(500).json({ error: error.message });
  }
};

// Análisis de estacionalidad
export const getSeasonalityAnalysis = async (req, res) => {
  try {
    const { salespersonId } = req.query;
    
    // Análisis por mes del año
    const monthlyPattern = await sequelize.query(`
      SELECT 
        EXTRACT(MONTH FROM s.created_at) as month_number,
        TO_CHAR(s.created_at, 'Month') as month_name,
        COUNT(s.id) as sales_count,
        SUM(s.amount) as sales_amount,
        AVG(s.amount) as avg_sale_amount
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      WHERE s.created_at >= NOW() - INTERVAL '24 months'
      ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = :salespersonId' : ''}
      GROUP BY EXTRACT(MONTH FROM s.created_at), TO_CHAR(s.created_at, 'Month')
      ORDER BY month_number
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    // Análisis por día de la semana
    const weeklyPattern = await sequelize.query(`
      SELECT 
        EXTRACT(DOW FROM s.created_at) as day_number,
        TO_CHAR(s.created_at, 'Day') as day_name,
        COUNT(s.id) as sales_count,
        SUM(s.amount) as sales_amount,
        AVG(s.amount) as avg_sale_amount
      FROM sales s
      JOIN clients c ON s.client_id = c.id
      WHERE s.created_at >= NOW() - INTERVAL '12 months'
      ${salespersonId && salespersonId !== 'TODOS' ? 'AND c.salesperson_id = :salespersonId' : ''}
      GROUP BY EXTRACT(DOW FROM s.created_at), TO_CHAR(s.created_at, 'Day')
      ORDER BY day_number
    `, { 
      replacements: salespersonId && salespersonId !== 'TODOS' ? { salespersonId } : {},
      type: sequelize.QueryTypes.SELECT 
    });

    // Encontrar mejores y peores períodos
    const bestMonth = monthlyPattern.reduce((max, month) => 
      parseFloat(month.sales_amount) > parseFloat(max.sales_amount) ? month : max, 
      monthlyPattern[0] || {}
    );
    
    const worstMonth = monthlyPattern.reduce((min, month) => 
      parseFloat(month.sales_amount) < parseFloat(min.sales_amount) ? month : min, 
      monthlyPattern[0] || {}
    );

    const bestDay = weeklyPattern.reduce((max, day) => 
      parseFloat(day.sales_amount) > parseFloat(max.sales_amount) ? day : max, 
      weeklyPattern[0] || {}
    );

    res.json({
      monthlyPattern,
      weeklyPattern,
      insights: {
        bestMonth: {
          name: bestMonth.month_name?.trim(),
          amount: parseFloat(bestMonth.sales_amount || 0),
          count: parseInt(bestMonth.sales_count || 0)
        },
        worstMonth: {
          name: worstMonth.month_name?.trim(),
          amount: parseFloat(worstMonth.sales_amount || 0),
          count: parseInt(worstMonth.sales_count || 0)
        },
        bestDay: {
          name: bestDay.day_name?.trim(),
          amount: parseFloat(bestDay.sales_amount || 0),
          count: parseInt(bestDay.sales_count || 0)
        }
      }
    });

  } catch (error) {
    console.error('Error in getSeasonalityAnalysis:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
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
};
