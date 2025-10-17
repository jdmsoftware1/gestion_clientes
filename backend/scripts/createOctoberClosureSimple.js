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
      
      // Actualizar fechas de ventas simuladas
      await updateSalesDateDistribution();
      return;
    }
    
    // Crear el cierre de octubre
    const dateFrom = '2025-10-01';
    const dateTo = '2025-10-31';
    
    console.log(`📊 Período del cierre: ${dateFrom} - ${dateTo}`);
    
    // Calcular métricas simples
    const totalSales = await Sale.sum('amount') || 0;
    const totalPayments = 0; // No hay pagos aún
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
    
    // Actualizar fechas de ventas simuladas
    await updateSalesDateDistribution();
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

async function updateSalesDateDistribution() {
  console.log('\n🔧 Distribuyendo fechas de ventas simuladas en octubre...');
  
  const simulatedSales = await Sale.findAll({
    where: {
      description: {
        [Op.like]: 'Deuda inicial%'
      }
    },
    attributes: ['id', 'description'],
    order: [['id', 'ASC']]
  });
  
  console.log(`📊 Ventas simuladas encontradas: ${simulatedSales.length}`);
  
  if (simulatedSales.length === 0) {
    console.log('⚠️  No hay ventas simuladas para actualizar');
    return;
  }
  
  // Distribuir las ventas a lo largo del mes de octubre
  const startDate = new Date('2025-10-01T08:00:00Z');
  const endDate = new Date('2025-10-31T18:00:00Z');
  const totalDays = 31;
  
  let updatedCount = 0;
  
  for (let i = 0; i < simulatedSales.length; i++) {
    const sale = simulatedSales[i];
    
    // Distribuir las ventas uniformemente a lo largo del mes
    const dayOffset = Math.floor((i / simulatedSales.length) * totalDays);
    const saleDate = new Date(startDate);
    saleDate.setDate(saleDate.getDate() + dayOffset);
    
    // Añadir algo de aleatoriedad en la hora (entre 8 AM y 6 PM)
    const randomHours = Math.floor(Math.random() * 10) + 8; // 8-18
    const randomMinutes = Math.floor(Math.random() * 60);
    saleDate.setHours(randomHours, randomMinutes, 0, 0);
    
    try {
      await sequelize.query(
        'UPDATE sales SET created_at = :saleDate, updated_at = :saleDate WHERE id = :saleId',
        {
          replacements: { 
            saleDate: saleDate.toISOString(), 
            saleId: sale.id 
          },
          type: sequelize.QueryTypes.UPDATE
        }
      );
      
      updatedCount++;
      
      if (updatedCount % 50 === 0) {
        console.log(`   Actualizadas ${updatedCount}/${simulatedSales.length} ventas...`);
      }
    } catch (error) {
      console.error(`   Error actualizando venta ${sale.id}:`, error.message);
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
    LIMIT 15
  `, { type: sequelize.QueryTypes.SELECT });
  
  console.log('\n📊 Distribución final de ventas por fecha (primeros 15 días):');
  finalDistribution.forEach(row => {
    console.log(`   - ${row.date}: ${row.count} ventas`);
  });
}

createOctoberClosure();
