import sequelize from '../config/database.js';
import { Client, Salesperson, Sale, Payment } from '../models/index.js';
import { Op } from 'sequelize';

async function verifyDataIntegrity() {
  try {
    console.log('🔍 Verificando integridad completa de datos...\n');
    
    await sequelize.authenticate();
    
    // 1. Verificar clientes sin vendedor
    console.log('1️⃣ VERIFICANDO CLIENTES SIN VENDEDOR:');
    const clientsWithoutSalesperson = await Client.findAll({
      where: { salespersonId: null },
      attributes: ['id', 'name', 'internalCode', 'salespersonId'],
      raw: true
    });
    
    console.log(`   📊 Clientes sin vendedor: ${clientsWithoutSalesperson.length}`);
    if (clientsWithoutSalesperson.length > 0) {
      console.log('   ❌ CLIENTES PROBLEMÁTICOS:');
      clientsWithoutSalesperson.forEach(client => {
        console.log(`      - ${client.name} (${client.internalCode}) → salespersonId: ${client.salespersonId}`);
      });
    } else {
      console.log('   ✅ Todos los clientes tienen vendedor asignado');
    }
    
    // 2. Verificar vendedores existentes
    console.log('\n2️⃣ VERIFICANDO VENDEDORES:');
    const salespeople = await Salesperson.findAll({
      attributes: ['id', 'name', 'email'],
      raw: true
    });
    
    console.log(`   📊 Total vendedores: ${salespeople.length}`);
    salespeople.forEach(sp => {
      console.log(`      - ${sp.name} (${sp.id})`);
    });
    
    // 3. Verificar distribución de clientes por vendedor
    console.log('\n3️⃣ DISTRIBUCIÓN DE CLIENTES POR VENDEDOR:');
    const distribution = await sequelize.query(`
      SELECT 
        s.name as salesperson_name,
        s.id as salesperson_id,
        COUNT(c.id) as client_count,
        COUNT(CASE WHEN c.salesperson_id IS NULL THEN 1 END) as null_count
      FROM salespeople s
      LEFT JOIN clients c ON s.id = c.salesperson_id
      GROUP BY s.id, s.name
      ORDER BY client_count DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    distribution.forEach(item => {
      console.log(`   - ${item.salesperson_name}: ${item.client_count} clientes (nulls: ${item.null_count})`);
    });
    
    // 4. Verificar ventas simuladas
    console.log('\n4️⃣ VERIFICANDO VENTAS SIMULADAS:');
    const salesCount = await Sale.count();
    const totalSalesAmount = await Sale.sum('amount') || 0;
    
    console.log(`   📊 Total ventas: ${salesCount}`);
    console.log(`   💰 Importe total: €${totalSalesAmount.toFixed(2)}`);
    
    // Verificar ventas por descripción
    const simulatedSales = await Sale.count({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      }
    });
    
    console.log(`   🔄 Ventas simuladas (Deuda inicial): ${simulatedSales}`);
    
    // 5. Verificar clientes sin ventas
    console.log('\n5️⃣ VERIFICANDO CLIENTES SIN VENTAS:');
    const clientsWithoutSales = await sequelize.query(`
      SELECT c.name, c.internal_code, c.salesperson_id
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      WHERE s.id IS NULL
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`   📊 Clientes sin ventas: ${clientsWithoutSales.length} (mostrando primeros 10)`);
    clientsWithoutSales.forEach(client => {
      console.log(`      - ${client.name} (${client.internal_code})`);
    });
    
    // 6. Verificar consistencia de deudas
    console.log('\n6️⃣ VERIFICANDO CONSISTENCIA DE DEUDAS:');
    const debtCheck = await sequelize.query(`
      SELECT 
        COUNT(*) as total_clients,
        COUNT(CASE WHEN debt.calculated_debt > 0 THEN 1 END) as clients_with_debt,
        COUNT(CASE WHEN debt.calculated_debt = 0 THEN 1 END) as clients_no_debt,
        COUNT(CASE WHEN debt.calculated_debt < 0 THEN 1 END) as clients_negative_debt,
        ROUND(AVG(debt.calculated_debt), 2) as avg_debt
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
    
    const stats = debtCheck[0];
    console.log(`   📊 Total clientes: ${stats.total_clients}`);
    console.log(`   💰 Con deuda: ${stats.clients_with_debt}`);
    console.log(`   ✅ Sin deuda: ${stats.clients_no_debt}`);
    console.log(`   ⚠️  Deuda negativa: ${stats.clients_negative_debt}`);
    console.log(`   📈 Deuda promedio: €${stats.avg_debt}`);
    
    // 7. Verificar referencias rotas
    console.log('\n7️⃣ VERIFICANDO REFERENCIAS ROTAS:');
    const brokenRefs = await sequelize.query(`
      SELECT c.name, c.internal_code, c.salesperson_id
      FROM clients c
      LEFT JOIN salespeople s ON c.salesperson_id = s.id
      WHERE c.salesperson_id IS NOT NULL AND s.id IS NULL
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log(`   📊 Referencias rotas: ${brokenRefs.length}`);
    if (brokenRefs.length > 0) {
      console.log('   ❌ REFERENCIAS PROBLEMÁTICAS:');
      brokenRefs.forEach(client => {
        console.log(`      - ${client.name} → salespersonId inexistente: ${client.salesperson_id}`);
      });
    } else {
      console.log('   ✅ Todas las referencias son válidas');
    }
    
    console.log('\n🎯 RESUMEN FINAL:');
    console.log(`   - Clientes sin vendedor: ${clientsWithoutSalesperson.length}`);
    console.log(`   - Referencias rotas: ${brokenRefs.length}`);
    console.log(`   - Ventas simuladas: ${simulatedSales}`);
    console.log(`   - Total vendedores: ${salespeople.length}`);
    
    if (clientsWithoutSalesperson.length === 0 && brokenRefs.length === 0) {
      console.log('   ✅ DATOS ÍNTEGROS Y CONSISTENTES');
    } else {
      console.log('   ❌ SE REQUIEREN CORRECCIONES');
    }
    
  } catch (error) {
    console.error('❌ Error durante verificación:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

verifyDataIntegrity();
