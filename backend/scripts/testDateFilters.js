import sequelize from '../config/database.js';

async function testDateFilters() {
  try {
    await sequelize.authenticate();
    
    // Verificar fechas de ventas
    console.log('📅 Verificando fechas de ventas...');
    const salesDates = await sequelize.query(`
      SELECT 
        created_at,
        DATE(created_at) as date_only,
        description
      FROM sales 
      WHERE description LIKE 'Deuda inicial%'
      LIMIT 3
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Fechas de ventas:');
    salesDates.forEach(sale => {
      console.log(`- ${sale.description}: ${sale.created_at} (fecha: ${sale.date_only})`);
    });
    
    // Probar filtro de fecha
    console.log('\n🔍 Probando filtro de fecha...');
    const filteredSales = await sequelize.query(`
      SELECT 
        sp.id,
        sp.name,
        sp.email,
        COALESCE(SUM(s.amount), 0) as total_sold
      FROM salespeople sp
      LEFT JOIN clients c ON sp.id = c.salesperson_id
      LEFT JOIN sales s ON c.id = s.client_id
      WHERE s.created_at >= '2024-12-31' AND s.created_at <= '2024-12-31 23:59:59'
      GROUP BY sp.id, sp.name, sp.email
      ORDER BY total_sold DESC
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('Resultados del filtro:');
    filteredSales.forEach(result => {
      console.log(`- ${result.name}: €${parseFloat(result.total_sold).toFixed(2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testDateFilters();
