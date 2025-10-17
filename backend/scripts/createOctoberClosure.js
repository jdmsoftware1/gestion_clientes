import sequelize from '../config/database.js';
import { MonthClosure, Sale } from '../models/index.js';
import { Op } from 'sequelize';

async function createOctoberClosure() {
  try {
    console.log('📅 Creando cierre de mes "Octubre"...');
    
    await sequelize.authenticate();
    
    // Verificar si ya existe un cierre de octubre
    const existingClosure = await MonthClosure.findOne({
      where: { name: 'Octubre' }
    });
    
    if (existingClosure) {
      console.log('✅ Ya existe un cierre llamado "Octubre"');
      console.log(`   Período: ${existingClosure.dateFrom} - ${existingClosure.dateTo}`);
      return;
    }
    
    // Obtener el último cierre para calcular dateFrom
    const lastClosure = await MonthClosure.findOne({
      order: [['dateTo', 'DESC']]
    });
    
    let dateFrom, dateTo;
    
    if (lastClosure) {
      // Empezar el día después del último cierre
      const lastDate = new Date(lastClosure.dateTo);
      lastDate.setDate(lastDate.getDate() + 1);
      dateFrom = lastDate.toISOString().split('T')[0];
    } else {
      // Si no hay cierres previos, empezar desde el 1 de octubre
      dateFrom = '2025-10-01';
    }
    
    // Terminar hoy
    dateTo = new Date().toISOString().split('T')[0];
    
    console.log(`📊 Período del cierre: ${dateFrom} - ${dateTo}`);
    
    // Calcular métricas del período
    const metrics = await sequelize.query(`
      SELECT 
        COALESCE(SUM(s.amount), 0) as total_sales,
        COALESCE(SUM(p.amount), 0) as total_payments,
        COUNT(s.id) as sales_count,
        COUNT(p.id) as payments_count
      FROM sales s
      FULL OUTER JOIN payments p ON 1=1
      WHERE (s.created_at >= :dateFrom AND s.created_at <= :dateTo || '23:59:59')
         OR (p.created_at >= :dateFrom AND p.created_at <= :dateTo || '23:59:59')
    `, {
      replacements: { dateFrom, dateTo },
      type: sequelize.QueryTypes.SELECT
    });
    
    const totalSales = parseFloat(metrics[0]?.total_sales) || 0;
    const totalPayments = parseFloat(metrics[0]?.total_payments) || 0;
    const totalDebt = totalSales - totalPayments;
    const netAmount = totalSales - totalPayments;
    
    // Crear el cierre
    const closure = await MonthClosure.create({
      name: 'Octubre',
      dateFrom,
      dateTo,
      salespersonId: null, // Para todos los vendedores
      totalSales,
      totalPayments,
      totalDebt,
      netAmount,
      description: 'Cierre mensual de octubre 2025 - Incluye todas las ventas simuladas',
      closedBy: 'Sistema'
    });
    
    console.log('✅ Cierre "Octubre" creado exitosamente:');
    console.log(`   ID: ${closure.id}`);
    console.log(`   Período: ${dateFrom} - ${dateTo}`);
    console.log(`   Total Ventas: €${totalSales.toFixed(2)}`);
    console.log(`   Total Pagos: €${totalPayments.toFixed(2)}`);
    console.log(`   Deuda Total: €${totalDebt.toFixed(2)}`);
    console.log(`   Neto: €${netAmount.toFixed(2)}`);
    
    // Ahora voy a ajustar las fechas de las ventas simuladas para que estén distribuidas en el período
    console.log('\n🔧 Ajustando fechas de ventas simuladas...');
    
    const simulatedSales = await Sale.findAll({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      },
      attributes: ['id', 'description', 'created_at']
    });
    
    console.log(`📊 Ventas simuladas encontradas: ${simulatedSales.length}`);
    
    // Distribuir las ventas a lo largo del mes de octubre
    const startDate = new Date('2025-10-01');
    const endDate = new Date('2025-10-31');
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    let updatedCount = 0;
    
    for (let i = 0; i < simulatedSales.length; i++) {
      const sale = simulatedSales[i];
      
      // Distribuir las ventas uniformemente a lo largo del mes
      const dayOffset = Math.floor((i / simulatedSales.length) * daysDiff);
      const saleDate = new Date(startDate);
      saleDate.setDate(saleDate.getDate() + dayOffset);
      
      // Añadir algo de aleatoriedad en la hora
      saleDate.setHours(Math.floor(Math.random() * 12) + 8); // Entre 8 AM y 8 PM
      saleDate.setMinutes(Math.floor(Math.random() * 60));
      
      await Sale.update(
        { 
          created_at: saleDate,
          updated_at: saleDate
        },
        { where: { id: sale.id } }
      );
      
      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`   Actualizadas ${updatedCount}/${simulatedSales.length} ventas...`);
      }
    }
    
    console.log(`✅ ${updatedCount} ventas actualizadas con fechas distribuidas en octubre`);
    
    // Verificar la distribución final
    const finalDistribution = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM sales 
      WHERE description LIKE 'Deuda inicial%'
      GROUP BY DATE(created_at)
      ORDER BY date
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📊 Distribución final de ventas por fecha:');
    finalDistribution.forEach(row => {
      console.log(`   - ${row.date}: ${row.count} ventas`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createOctoberClosure();
