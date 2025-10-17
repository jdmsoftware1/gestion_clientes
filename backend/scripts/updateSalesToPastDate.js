import sequelize from '../config/database.js';
import { Sale } from '../models/index.js';
import { Op } from 'sequelize';

async function updateSalesToPastDate() {
  try {
    console.log('📅 Actualizando todas las ventas simuladas a 31/12/2024...');
    
    await sequelize.authenticate();
    
    // Fecha fija para todas las ventas simuladas
    const fixedDate = new Date('2024-12-31T12:00:00Z');
    
    console.log(`🎯 Fecha objetivo: ${fixedDate.toISOString()}`);
    
    // Buscar todas las ventas simuladas (que tienen "Deuda inicial" en la descripción)
    const simulatedSales = await Sale.findAll({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      },
      attributes: ['id', 'description', 'amount']
    });
    
    console.log(`📊 Ventas simuladas encontradas: ${simulatedSales.length}`);
    
    if (simulatedSales.length === 0) {
      console.log('⚠️  No hay ventas simuladas para actualizar');
      return;
    }
    
    // Actualizar todas las ventas simuladas a la fecha fija
    const updateResult = await Sale.update(
      { 
        created_at: fixedDate,
        updated_at: fixedDate
      },
      {
        where: {
          description: {
            [Op.like]: 'Deuda inicial%'
          }
        }
      }
    );
    
    console.log(`✅ ${updateResult[0]} ventas actualizadas exitosamente`);
    
    // Verificar el resultado
    const verification = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount::numeric) as total_amount
      FROM sales 
      WHERE description LIKE 'Deuda inicial%'
      GROUP BY DATE(created_at)
      ORDER BY date
    `, { type: sequelize.QueryTypes.SELECT });
    
    console.log('\n📊 Verificación - Ventas por fecha:');
    verification.forEach(row => {
      console.log(`   - ${row.date}: ${row.count} ventas, €${parseFloat(row.total_amount).toFixed(2)}`);
    });
    
    // Verificar que no hay ventas simuladas en fechas recientes
    const recentSales = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM sales 
      WHERE description LIKE 'Deuda inicial%'
        AND created_at >= '2025-01-01'
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (recentSales[0].count > 0) {
      console.log(`⚠️  Advertencia: Aún hay ${recentSales[0].count} ventas simuladas en fechas recientes`);
    } else {
      console.log('✅ Confirmado: No hay ventas simuladas en fechas recientes (2025+)');
    }
    
    console.log('\n🎉 Actualización completada exitosamente');
    console.log('📝 Ahora todas las ventas simuladas están en 31/12/2024');
    console.log('📝 Los filtros de fecha funcionarán correctamente para nuevas ventas');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateSalesToPastDate();
