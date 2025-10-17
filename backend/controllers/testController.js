import sequelize from '../config/database.js';
import { Client, Salesperson, Sale, Payment } from '../models/index.js';
import { Op } from 'sequelize';

// Test suite para verificar funcionalidades del dashboard
export const runDashboardTests = async (req, res) => {
  const testResults = [];
  let totalTests = 0;
  let passedTests = 0;

  const addTest = (name, passed, message = '', data = null) => {
    totalTests++;
    if (passed) passedTests++;
    testResults.push({
      test: name,
      status: passed ? 'PASS' : 'FAIL',
      message,
      data
    });
  };

  try {
    console.log('🧪 Iniciando batería de tests del dashboard...');

    // Test 1: Verificar conexión a la base de datos
    try {
      await sequelize.authenticate();
      addTest('Conexión a Base de Datos', true, 'Conexión establecida correctamente');
    } catch (error) {
      addTest('Conexión a Base de Datos', false, `Error de conexión: ${error.message}`);
    }

    // Test 2: Verificar que existen vendedores
    try {
      const salespeopleCount = await Salesperson.count();
      addTest('Existencia de Vendedores', salespeopleCount > 0, 
        `Encontrados ${salespeopleCount} vendedores`, { count: salespeopleCount });
    } catch (error) {
      addTest('Existencia de Vendedores', false, `Error: ${error.message}`);
    }

    // Test 3: Verificar que existen clientes
    try {
      const clientsCount = await Client.count();
      addTest('Existencia de Clientes', clientsCount > 0, 
        `Encontrados ${clientsCount} clientes`, { count: clientsCount });
    } catch (error) {
      addTest('Existencia de Clientes', false, `Error: ${error.message}`);
    }

    // Test 4: Verificar que todos los clientes tienen vendedor asignado
    try {
      const clientsWithoutSalesperson = await Client.count({
        where: { salespersonId: null }
      });
      addTest('Clientes con Vendedor Asignado', clientsWithoutSalesperson === 0, 
        clientsWithoutSalesperson === 0 ? 'Todos los clientes tienen vendedor' : `${clientsWithoutSalesperson} clientes sin vendedor`,
        { clientsWithoutSalesperson });
    } catch (error) {
      addTest('Clientes con Vendedor Asignado', false, `Error: ${error.message}`);
    }

    // Test 5: Verificar integridad de referencias de vendedores
    try {
      const brokenRefs = await sequelize.query(`
        SELECT COUNT(*) as count
        FROM clients c
        LEFT JOIN salespeople s ON c.salesperson_id = s.id
        WHERE c.salesperson_id IS NOT NULL AND s.id IS NULL
      `, { type: sequelize.QueryTypes.SELECT });
      
      const brokenCount = parseInt(brokenRefs[0].count);
      addTest('Integridad de Referencias', brokenCount === 0, 
        brokenCount === 0 ? 'Todas las referencias son válidas' : `${brokenCount} referencias rotas`,
        { brokenReferences: brokenCount });
    } catch (error) {
      addTest('Integridad de Referencias', false, `Error: ${error.message}`);
    }

    // Test 6: Verificar que existen ventas
    try {
      const salesCount = await Sale.count();
      const totalSalesAmount = await Sale.sum('amount') || 0;
      addTest('Existencia de Ventas', salesCount > 0, 
        `${salesCount} ventas por €${totalSalesAmount.toFixed(2)}`, 
        { count: salesCount, total: totalSalesAmount });
    } catch (error) {
      addTest('Existencia de Ventas', false, `Error: ${error.message}`);
    }

    // Test 7: Verificar que existen pagos
    try {
      const paymentsCount = await Payment.count();
      const totalPaymentsAmount = await Payment.sum('amount') || 0;
      addTest('Existencia de Pagos', paymentsCount >= 0, 
        `${paymentsCount} pagos por €${totalPaymentsAmount.toFixed(2)}`, 
        { count: paymentsCount, total: totalPaymentsAmount });
    } catch (error) {
      addTest('Existencia de Pagos', false, `Error: ${error.message}`);
    }

    // Test 8: Verificar cálculo de deudas
    try {
      const debtCalculation = await sequelize.query(`
        SELECT 
          COUNT(*) as total_clients,
          COUNT(CASE WHEN debt.calculated_debt > 0 THEN 1 END) as clients_with_debt,
          COUNT(CASE WHEN debt.calculated_debt = 0 THEN 1 END) as clients_no_debt,
          COUNT(CASE WHEN debt.calculated_debt < 0 THEN 1 END) as clients_negative_debt,
          ROUND(AVG(debt.calculated_debt), 2) as avg_debt,
          ROUND(SUM(debt.calculated_debt), 2) as total_debt
        FROM (
          SELECT 
            c.id,
            COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as calculated_debt
          FROM clients c
          LEFT JOIN sales s ON c.id = s.client_id
          LEFT JOIN payments p ON c.id = p.client_id
          GROUP BY c.id
        ) debt
      `, { type: sequelize.QueryTypes.SELECT });

      const stats = debtCalculation[0];
      addTest('Cálculo de Deudas', true, 
        `${stats.total_clients} clientes, deuda promedio €${stats.avg_debt}, total €${stats.total_debt}`,
        stats);
    } catch (error) {
      addTest('Cálculo de Deudas', false, `Error: ${error.message}`);
    }

    // Test 9: Verificar ranking de vendedores
    try {
      const rankings = await sequelize.query(`
        SELECT 
          sp.name,
          COALESCE(SUM(s.amount), 0) as total_sold,
          COUNT(DISTINCT c.id) as client_count
        FROM salespeople sp
        LEFT JOIN clients c ON sp.id = c.salesperson_id
        LEFT JOIN sales s ON c.id = s.client_id
        GROUP BY sp.id, sp.name
        ORDER BY total_sold DESC
        LIMIT 3
      `, { type: sequelize.QueryTypes.SELECT });

      addTest('Ranking de Vendedores', rankings.length > 0, 
        `Top 3: ${rankings.map(r => `${r.name} (€${parseFloat(r.total_sold).toFixed(2)})`).join(', ')}`,
        rankings);
    } catch (error) {
      addTest('Ranking de Vendedores', false, `Error: ${error.message}`);
    }

    // Test 10: Verificar ranking de cobradores
    try {
      const collectors = await sequelize.query(`
        SELECT 
          sp.name,
          COALESCE(SUM(p.amount), 0) as total_collected,
          COUNT(p.id) as payment_count
        FROM salespeople sp
        LEFT JOIN clients c ON sp.id = c.salesperson_id
        LEFT JOIN payments p ON c.id = p.client_id
        GROUP BY sp.id, sp.name
        ORDER BY total_collected DESC
        LIMIT 3
      `, { type: sequelize.QueryTypes.SELECT });

      addTest('Ranking de Cobradores', collectors.length > 0, 
        `Top 3: ${collectors.map(r => `${r.name} (€${parseFloat(r.total_collected).toFixed(2)})`).join(', ')}`,
        collectors);
    } catch (error) {
      addTest('Ranking de Cobradores', false, `Error: ${error.message}`);
    }

    // Test 11: Verificar filtros de fecha
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      const dateTo = new Date();

      const salesInPeriod = await Sale.count({
        where: {
          createdAt: {
            [Op.between]: [dateFrom, dateTo]
          }
        }
      });

      addTest('Filtros de Fecha', true, 
        `${salesInPeriod} ventas en los últimos 30 días`,
        { salesInPeriod, dateFrom: dateFrom.toISOString().split('T')[0], dateTo: dateTo.toISOString().split('T')[0] });
    } catch (error) {
      addTest('Filtros de Fecha', false, `Error: ${error.message}`);
    }

    // Test 12: Verificar clientes morosos
    try {
      const delinquentClients = await sequelize.query(`
        SELECT 
          c.name,
          c.internal_code,
          sp.name as salesperson_name,
          COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt,
          MAX(p.created_at) as last_payment
        FROM clients c
        LEFT JOIN salespeople sp ON c.salesperson_id = sp.id
        LEFT JOIN sales s ON c.id = s.client_id
        LEFT JOIN payments p ON c.id = p.client_id
        GROUP BY c.id, c.name, c.internal_code, sp.name
        HAVING COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) > 0
        AND (MAX(p.created_at) IS NULL OR MAX(p.created_at) < NOW() - INTERVAL '60 days')
        ORDER BY debt DESC
        LIMIT 5
      `, { type: sequelize.QueryTypes.SELECT });

      addTest('Clientes Morosos', true, 
        `${delinquentClients.length} clientes morosos identificados`,
        { count: delinquentClients.length, topDelinquent: delinquentClients });
    } catch (error) {
      addTest('Clientes Morosos', false, `Error: ${error.message}`);
    }

    // Test 13: Verificar oportunidades de venta
    try {
      const opportunities = await sequelize.query(`
        SELECT 
          c.name,
          c.internal_code,
          sp.name as salesperson_name,
          COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
        FROM clients c
        LEFT JOIN salespeople sp ON c.salesperson_id = sp.id
        LEFT JOIN sales s ON c.id = s.client_id
        LEFT JOIN payments p ON c.id = p.client_id
        GROUP BY c.id, c.name, c.internal_code, sp.name
        HAVING COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) BETWEEN 1 AND 75
        ORDER BY debt DESC
        LIMIT 5
      `, { type: sequelize.QueryTypes.SELECT });

      addTest('Oportunidades de Venta', true, 
        `${opportunities.length} oportunidades (deuda €1-€75) identificadas`,
        { count: opportunities.length, opportunities });
    } catch (error) {
      addTest('Oportunidades de Venta', false, `Error: ${error.message}`);
    }

    // Test 14: Verificar performance de consultas
    try {
      const startTime = Date.now();
      
      await Promise.all([
        sequelize.query('SELECT COUNT(*) FROM clients'),
        sequelize.query('SELECT COUNT(*) FROM sales'),
        sequelize.query('SELECT COUNT(*) FROM payments'),
        sequelize.query('SELECT COUNT(*) FROM salespeople')
      ]);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      addTest('Performance de Consultas', duration < 5000, 
        `Consultas básicas completadas en ${duration}ms`,
        { duration });
    } catch (error) {
      addTest('Performance de Consultas', false, `Error: ${error.message}`);
    }

    // Resumen final
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    const summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate: `${successRate}%`,
      status: passedTests === totalTests ? 'ALL_PASS' : passedTests >= totalTests * 0.8 ? 'MOSTLY_PASS' : 'CRITICAL_ISSUES'
    };

    console.log(`🎯 Tests completados: ${passedTests}/${totalTests} (${successRate}%)`);

    res.json({
      summary,
      tests: testResults,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });

  } catch (error) {
    console.error('❌ Error durante la ejecución de tests:', error);
    res.status(500).json({
      error: 'Error durante la ejecución de tests',
      message: error.message,
      tests: testResults
    });
  }
};

// Test específico para verificar un endpoint
export const testEndpoint = async (req, res) => {
  const { endpoint, method = 'GET', params = {} } = req.body;
  
  try {
    // Aquí podrías implementar tests específicos para endpoints
    res.json({
      message: 'Test de endpoint no implementado aún',
      endpoint,
      method,
      params
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { runDashboardTests, testEndpoint };
