import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
let section = '';

async function logTest(name, success, details = '') {
  if (success) {
    testsPassed++;
    console.log(`  ${colors.green}✓${colors.reset} ${name}`);
  } else {
    testsFailed++;
    console.log(`  ${colors.red}✗${colors.reset} ${name}`);
    if (details) console.log(`    ${colors.yellow}${details}${colors.reset}`);
  }
}

function startSection(name) {
  section = name;
  console.log(`\n${colors.cyan}${name}${colors.reset}`);
}

async function runHistoricalAnalyticsTests() {
  console.log(`\n${colors.blue}=== TEST ANALYTICS HISTÓRICOS ===${colors.reset}\n`);

  // ===== ANALYTICS HISTÓRICOS =====
  startSection('📊 ANALYTICS HISTÓRICOS');

  try {
    // Test 1: Obtener analytics históricos generales (sin filtros)
    const response1 = await api.get('/dashboard/historical');
    const success1 = response1.status === 200 &&
                    response1.data &&
                    typeof response1.data.totalHistoricalSales === 'number' &&
                    typeof response1.data.totalHistoricalPayments === 'number' &&
                    typeof response1.data.netHistoricalAmount === 'number';
    await logTest('GET /dashboard/historical - Analytics generales', success1,
      success1 ? `Ventas: ${response1.data.totalHistoricalSales}, Pagos: ${response1.data.totalHistoricalPayments}` :
                 `Status ${response1.status}`);

    // Test 2: Verificar estructura de respuesta completa
    if (success1) {
      const data = response1.data;
      const hasSummary = data.summary && typeof data.summary.totalSales === 'number';
      const hasSalesByPeriod = Array.isArray(data.salesByPeriod);
      const hasPaymentsByPeriod = Array.isArray(data.paymentsByPeriod);
      const hasTopClients = Array.isArray(data.topClients);
      const hasTopProducts = Array.isArray(data.topProducts);

      await logTest('Estructura de respuesta completa', hasSummary && hasSalesByPeriod && hasPaymentsByPeriod && hasTopClients && hasTopProducts,
        hasSummary ? 'Summary, períodos y rankings OK' : 'Faltan campos en respuesta');
    }

    // Test 3: Filtrar por año específico (2021)
    const response2 = await api.get('/dashboard/historical?year=2021');
    const success2 = response2.status === 200 &&
                    response2.data &&
                    response2.data.summary;
    await logTest('GET /dashboard/historical?year=2021 - Filtro por año', success2,
      success2 ? `Datos filtrados para 2021` : `Status ${response2.status}`);

    // Test 4: Filtrar por año y mes específico
    const response3 = await api.get('/dashboard/historical?year=2021&month=1');
    const success3 = response3.status === 200 &&
                    response3.data &&
                    response3.data.summary;
    await logTest('GET /dashboard/historical?year=2021&month=1 - Filtro año+mes', success3,
      success3 ? `Datos filtrados para enero 2021` : `Status ${response3.status}`);

    // Test 5: Verificar que los datos históricos no estén vacíos
    if (success1) {
      const data = response1.data;
      const hasData = (data.totalHistoricalSales > 0) ||
                     (data.totalHistoricalPayments > 0) ||
                     (data.salesByPeriod && data.salesByPeriod.length > 0) ||
                     (data.paymentsByPeriod && data.paymentsByPeriod.length > 0);

      await logTest('Datos históricos disponibles', hasData,
        hasData ? 'Datos históricos encontrados' : 'No hay datos históricos');
    }

    // Test 6: Verificar Top 10 clientes
    if (success1 && response1.data.topClients) {
      const topClients = response1.data.topClients;
      const validTopClients = Array.isArray(topClients) &&
                             topClients.length <= 10 &&
                             topClients.every(client =>
                               client.name && typeof client.totalSpent === 'number'
                             );
      await logTest('Top 10 clientes históricos', validTopClients,
        validTopClients ? `${topClients.length} clientes en ranking` : 'Estructura de top clientes inválida');
    }

    // Test 7: Verificar Top 10 productos
    if (success1 && response1.data.topProducts) {
      const topProducts = response1.data.topProducts;
      const validTopProducts = Array.isArray(topProducts) &&
                              topProducts.length <= 10 &&
                              topProducts.every(product =>
                                product.name && typeof product.totalRevenue === 'number'
                              );
      await logTest('Top 10 productos históricos', validTopProducts,
        validTopProducts ? `${topProducts.length} productos en ranking` : 'Estructura de top productos inválida');
    }

    // Test 8: Verificar ventas por período
    if (success1 && response1.data.salesByPeriod) {
      const salesByPeriod = response1.data.salesByPeriod;
      const validSalesByPeriod = Array.isArray(salesByPeriod) &&
                                salesByPeriod.every(period =>
                                  period.period && typeof period.totalSales === 'number'
                                );
      await logTest('Ventas por período', validSalesByPeriod,
        validSalesByPeriod ? `${salesByPeriod.length} períodos analizados` : 'Estructura de ventas por período inválida');
    }

    // Test 9: Verificar pagos por período
    if (success1 && response1.data.paymentsByPeriod) {
      const paymentsByPeriod = response1.data.paymentsByPeriod;
      const validPaymentsByPeriod = Array.isArray(paymentsByPeriod) &&
                                   paymentsByPeriod.every(period =>
                                     period.period && typeof period.totalPayments === 'number'
                                   );
      await logTest('Pagos por período', validPaymentsByPeriod,
        validPaymentsByPeriod ? `${paymentsByPeriod.length} períodos analizados` : 'Estructura de pagos por período inválida');
    }

  } catch (error) {
    await logTest('Error de conexión', false, error.message);
  }

  // ===== RESULTADOS =====
  console.log(`\n${colors.blue}=== RESULTADOS ===${colors.reset}`);
  console.log(`${colors.green}✓ Tests pasados: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}✗ Tests fallidos: ${testsFailed}${colors.reset}`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 ¡Todos los tests de Analytics Históricos pasaron!${colors.reset}`);
    console.log(`${colors.cyan}📊 Sistema de analytics históricos funcionando correctamente${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Algunos tests fallaron. Revisa los errores arriba.${colors.reset}`);
  }

  return testsFailed === 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runHistoricalAnalyticsTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runHistoricalAnalyticsTests };
