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

async function runTests() {
  console.log(`\n${colors.blue}=== TEST COMPLETO DE ENDPOINTS ===${colors.reset}\n`);

  // ===== VENDEDORES =====
  startSection('📊 VENDEDORES (Salespeople)');

  let salespersonId = null;

  try {
    const response = await api.get('/salespeople');
    const success = response.status === 200 && Array.isArray(response.data) && response.data.length > 0;
    await logTest('GET /salespeople', success, success ? `${response.data.length} vendedores` : `Status ${response.status}`);
    if (success) salespersonId = response.data[0].id;
  } catch (error) {
    await logTest('GET /salespeople', false, error.message);
  }

  // ===== CLIENTES =====
  startSection('👥 CLIENTES');

  let clientId = null;

  try {
    const response = await api.get('/clients');
    const success = response.status === 200 && Array.isArray(response.data);
    await logTest('GET /clients (sin filtro)', success, success ? `${response.data.length} clientes` : `Status ${response.status}`);
    if (success && response.data.length > 0) clientId = response.data[0].id;
  } catch (error) {
    await logTest('GET /clients (sin filtro)', false, error.message);
  }

  if (salespersonId) {
    try {
      const response = await api.get(`/clients?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /clients?salespersonId=...`,
        success,
        success ? `${response.data.length} clientes para este vendedor` : `Status ${response.status}`
      );
    } catch (error) {
      await logTest(`GET /clients?salespersonId=...`, false, error.message);
    }
  }

  if (clientId) {
    try {
      const response = await api.get(`/clients/${clientId}`);
      const success = response.status === 200 && response.data.id === clientId;
      await logTest(`GET /clients/:id`, success, success ? `${response.data.name}` : `Status ${response.status}`);
    } catch (error) {
      await logTest(`GET /clients/:id`, false, error.message);
    }
  }

  // ===== VENTAS =====
  startSection('💰 VENTAS');

  let saleId = null;

  try {
    const response = await api.get('/sales');
    const success = response.status === 200 && Array.isArray(response.data);
    await logTest('GET /sales', success, success ? `${response.data.length} ventas` : `Status ${response.status}`);
    if (success && response.data.length > 0) saleId = response.data[0].id;
  } catch (error) {
    await logTest('GET /sales', false, error.message);
  }

  if (salespersonId) {
    try {
      const response = await api.get(`/sales?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /sales?salespersonId=...`,
        success,
        success ? `${response.data.length} ventas para este vendedor` : `Status ${response.status}`
      );
    } catch (error) {
      await logTest(`GET /sales?salespersonId=...`, false, error.message);
    }
  }

  if (saleId) {
    try {
      const response = await api.get(`/sales/${saleId}`);
      const success = response.status === 200 && response.data.id === saleId;
      await logTest(`GET /sales/:id`, success, success ? `Venta de $${response.data.amount}` : `Status ${response.status}`);
    } catch (error) {
      await logTest(`GET /sales/:id`, false, error.message);
    }
  }

  // ===== PAGOS =====
  startSection('💳 PAGOS');

  let paymentId = null;

  try {
    const response = await api.get('/payments');
    const success = response.status === 200 && Array.isArray(response.data);
    await logTest('GET /payments', success, success ? `${response.data.length} pagos` : `Status ${response.status}`);
    if (success && response.data.length > 0) paymentId = response.data[0].id;
  } catch (error) {
    await logTest('GET /payments', false, error.message);
  }

  if (paymentId) {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      const success = response.status === 200 && response.data.id === paymentId;
      await logTest(`GET /payments/:id`, success, success ? `Pago de $${response.data.amount}` : `Status ${response.status}`);
    } catch (error) {
      await logTest(`GET /payments/:id`, false, error.message);
    }
  }

  // ===== DASHBOARD =====
  startSection('📈 DASHBOARD');

  if (salespersonId) {
    try {
      const response = await api.get(`/dashboard/kpis?salespersonId=${salespersonId}`);
      const success = response.status === 200 && response.data.totalDebt !== undefined;
      await logTest(
        `GET /dashboard/kpis`,
        success,
        success ? `Deuda: $${response.data.totalDebt}, Ventas: $${response.data.totalSales}` : `Status ${response.status}`
      );
    } catch (error) {
      await logTest(`GET /dashboard/kpis`, false, error.message);
    }

    try {
      const response = await api.get(`/dashboard/delinquent?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /dashboard/delinquent`,
        success,
        success ? `${response.data.length} clientes morosos` : `Status ${response.status}`
      );
    } catch (error) {
      await logTest(`GET /dashboard/delinquent`, false, error.message);
    }

    try {
      const response = await api.get(`/dashboard/opportunities?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /dashboard/opportunities`,
        success,
        success ? `${response.data.length} oportunidades` : `Status ${response.status}`
      );
    } catch (error) {
      await logTest(`GET /dashboard/opportunities`, false, error.message);
    }
  }

  // ===== RESUMEN =====
  console.log(`\n${colors.blue}=== RESUMEN ===${colors.reset}`);
  console.log(`${colors.green}Exitosos: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Fallidos: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 ¡TODOS LOS TESTS PASARON!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}⚠️  Algunos tests fallaron${colors.reset}\n`);
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});