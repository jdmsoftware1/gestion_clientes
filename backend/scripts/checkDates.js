import sequelize from '../config/database.js';
import { Sale } from '../models/index.js';

async function checkDates() {
  try {
    await sequelize.authenticate();
    console.log('📅 Verificando fechas de ventas...');
    
    const sales = await Sale.findAll({
      attributes: ['id', 'amount', 'description', 'created_at'],
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    
    console.log('Fechas de ventas:');
    sales.forEach(sale => {
      console.log(`- ${sale.description}: ${sale.created_at} (tipo: ${typeof sale.created_at})`);
      if (sale.created_at) {
        console.log(`  ISO: ${new Date(sale.created_at).toISOString()}`);
      }
    });
    
    // Verificar cuántas ventas hay por fecha
    const salesByDate = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM sales 
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📊 Ventas por fecha:');
    salesByDate.forEach(row => {
      console.log(`- ${row.date}: ${row.count} ventas`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDates();
