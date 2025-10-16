import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true, // No lanzar error en 4xx/5xx
});

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let testsPassed = 0;
let testsFailed = 0;

async function logTest(name, success, details = '') {
  if (success) {
    testsPassed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    testsFailed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (details) console.log(`  ${colors.yellow}${details}${colors.reset}`);
  }
}

async function runTests() {
  console.log(`\n${colors.blue}=== TEST DE ENDPOINTS ===${colors.reset}\n`);

  // Test 1: Obtener todos los vendedores
  console.log(`${colors.blue}1. Obteniendo vendedores...${colors.reset}`);
  let salespersonId = null;
  
  try {
    const response = await api.get('/salespeople');
    const success = response.status === 200 && response.data && response.data.length > 0;
    await logTest(
      'GET /api/salespeople',
      success,
      success
        ? `Encontrados ${response.data.length} vendedores`
        : `Status: ${response.status}, Data: ${JSON.stringify(response.data).substring(0, 100)}`
    );

    if (success) {
      salespersonId = response.data[0].id;
      console.log(`  Usando vendedor: ${response.data[0].name} (${salespersonId})\n`);
    }
  } catch (error) {
    await logTest('GET /api/salespeople', false, `Error: ${error.message}`);
  }

  // Test 2: Obtener todos los clientes (sin filtro)
  console.log(`${colors.blue}2. Probando endpoint de clientes...${colors.reset}`);
  
  try {
    const response = await api.get('/clients');
    const success = response.status === 200 && Array.isArray(response.data);
    await logTest(
      'GET /api/clients (sin filtro)',
      success,
      success
        ? `Encontrados ${response.data.length} clientes`
        : `Status: ${response.status}`
    );

    if (!success) {
      console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    }
  } catch (error) {
    await logTest('GET /api/clients (sin filtro)', false, `Error: ${error.message}`);
  }

  // Test 3: Obtener clientes con filtro de vendedor
  if (salespersonId) {
    console.log(`${colors.blue}3. Probando filtro de vendedor...${colors.reset}`);
    
    try {
      const response = await api.get(`/clients?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /api/clients?salespersonId=${salespersonId}`,
        success,
        success
          ? `Encontrados ${response.data.length} clientes para este vendedor`
          : `Status: ${response.status}`
      );

      if (!success) {
        console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}`);
        console.log(`  Full error:`, response.data);
      } else if (response.data.length > 0) {
        const client = response.data[0];
        console.log(`  Primer cliente: ${client.name} (${client.id})`);
      }
    } catch (error) {
      await logTest(
        `GET /api/clients?salespersonId=${salespersonId}`,
        false,
        `Error: ${error.message}`
      );
    }

    // Test 4: Dashboard KPIs
    console.log(`\n${colors.blue}4. Probando dashboard...${colors.reset}`);
    
    try {
      const response = await api.get(`/dashboard/kpis?salespersonId=${salespersonId}`);
      const success = response.status === 200 && response.data;
      await logTest(
        `GET /api/dashboard/kpis?salespersonId=${salespersonId}`,
        success,
        success
          ? `KPIs obtenidos: totalDebt=${response.data.totalDebt}, totalSales=${response.data.totalSales}`
          : `Status: ${response.status}`
      );

      if (!success) {
        console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}`);
      }
    } catch (error) {
      await logTest(
        `GET /api/dashboard/kpis?salespersonId=${salespersonId}`,
        false,
        `Error: ${error.message}`
      );
    }

    // Test 5: Dashboard delinquent
    try {
      const response = await api.get(`/dashboard/delinquent?salespersonId=${salespersonId}`);
      const success = response.status === 200 && Array.isArray(response.data);
      await logTest(
        `GET /api/dashboard/delinquent?salespersonId=${salespersonId}`,
        success,
        success
          ? `Encontrados ${response.data.length} clientes con deuda`
          : `Status: ${response.status}`
      );

      if (!success) {
        console.log(`  Response: ${JSON.stringify(response.data).substring(0, 200)}`);
      }
    } catch (error) {
      await logTest(
        `GET /api/dashboard/delinquent?salespersonId=${salespersonId}`,
        false,
        `Error: ${error.message}`
      );
    }
  }

  // Resumen
  console.log(`\n${colors.blue}=== RESUMEN ===${colors.reset}`);
  console.log(`${colors.green}Exitosos: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Fallidos: ${testsFailed}${colors.reset}`);
  console.log(`Total: ${testsPassed + testsFailed}\n`);

  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});