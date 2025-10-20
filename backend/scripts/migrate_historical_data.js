import sequelize from '../config/database.js';
import { HistoricalSale, HistoricalPayment } from '../models/index.js';

const migrateHistoricalData = async () => {
  try {
    console.log('🚀 Iniciando migración de datos históricos...');
    
    // Sincronizar modelos (crear tablas si no existen)
    console.log('📋 Sincronizando modelos...');
    await HistoricalSale.sync({ force: false });
    await HistoricalPayment.sync({ force: false });
    
    console.log('✅ Tablas de datos históricos creadas correctamente');
    
    // Verificar si ya existen datos
    const existingSales = await HistoricalSale.count();
    const existingPayments = await HistoricalPayment.count();
    
    console.log(`📊 Datos existentes: ${existingSales} ventas, ${existingPayments} pagos`);
    
    if (existingSales === 0) {
      console.log('📝 Insertando datos de ventas históricas...');
      
      const historicalSalesData = [
        { codCom: 1, codArt: 1, codCli: 12115, nombreCli: 'FRANCISCA', apellidosCli: 'MORENO', nombreArt: 'VARIOS', precio: -12.5, cantidad: 1, subtotal: -12.5, total: -12.5, fechaCom: '2021-01-23', vista: 3, cod_user: 1 },
        { codCom: 2, codArt: 1, codCli: 2006, nombreCli: 'MABEL', apellidosCli: 'PACHECO', nombreArt: 'VARIOS', precio: 97.15, cantidad: 1, subtotal: 97.15, total: 97.15, fechaCom: '2021-01-23', vista: 3, cod_user: 1 },
        { codCom: 3, codArt: 1, codCli: 4, nombreCli: 'MARISA', apellidosCli: '', nombreArt: 'VARIOS', precio: 75.45, cantidad: 1, subtotal: 75.45, total: 75.45, fechaCom: '2021-01-23', vista: 3, cod_user: 1 },
        { codCom: 4, codArt: 1, codCli: 12020, nombreCli: 'Marta', apellidosCli: '', nombreArt: 'VARIOS', precio: 212.4, cantidad: 1, subtotal: 212.4, total: 212.4, fechaCom: '2021-01-23', vista: 3, cod_user: 1 },
        { codCom: 5, codArt: 1, codCli: 12023, nombreCli: 'ANGELA HIJO', apellidosCli: '', nombreArt: 'ESTORES', precio: 225.32, cantidad: 1, subtotal: 225.32, total: 225.32, fechaCom: '2021-01-23', vista: 3, cod_user: 1 },
        { codCom: 6, codArt: 1, codCli: 12025, nombreCli: 'Angela', apellidosCli: '', nombreArt: 'VARIOS', precio: -61.5, cantidad: 1, subtotal: -61.5, total: -61.5, fechaCom: '2021-02-17', vista: 3, cod_user: 1 },
        { codCom: 7, codArt: 1, codCli: 1011, nombreCli: 'Rosa', apellidosCli: '', nombreArt: 'CORTINAS HABITACION', precio: 283.85, cantidad: 1, subtotal: 283.85, total: 283.85, fechaCom: '2021-03-22', vista: 3, cod_user: 1 },
        { codCom: 8, codArt: 1, codCli: 12120, nombreCli: 'Maite', apellidosCli: 'Melian Gonzalez', nombreArt: 'VARIOS', precio: 159.4, cantidad: 1, subtotal: 159.4, total: 159.4, fechaCom: '2021-03-22', vista: 3, cod_user: 1 },
        { codCom: 9, codArt: 1, codCli: 1, nombreCli: 'CONTADO', apellidosCli: '', nombreArt: 'cortinas tina', precio: 820, cantidad: 1, subtotal: 820, total: 820, fechaCom: '2021-03-29', vista: 3, cod_user: 1 },
        { codCom: 10, codArt: 1, codCli: 4624, nombreCli: 'CARMITA PLACIOS', apellidosCli: '', nombreArt: 'VARIOS', precio: 21, cantidad: 1, subtotal: 21, total: 21, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 11, codArt: 1, codCli: 12051, nombreCli: 'Amalia', apellidosCli: 'Zamora Gamez', nombreArt: 'VARIOS', precio: 138.9, cantidad: 1, subtotal: 138.9, total: 138.9, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 12, codArt: 1, codCli: 12110, nombreCli: 'ROSI', apellidosCli: '', nombreArt: 'VARIOS', precio: 40.65, cantidad: 1, subtotal: 40.65, total: 40.65, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 13, codArt: 1, codCli: 12220, nombreCli: 'ANDREA', apellidosCli: '', nombreArt: 'VARIOS', precio: 21.2, cantidad: 1, subtotal: 21.2, total: 21.2, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 14, codArt: 1, codCli: 12155, nombreCli: 'LOLI', apellidosCli: '(COSTURERA)', nombreArt: 'VARIOS', precio: 14.85, cantidad: 1, subtotal: 14.85, total: 14.85, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 15, codArt: 1, codCli: 12165, nombreCli: 'ROSI', apellidosCli: '', nombreArt: 'VARIOS', precio: -61.45, cantidad: 1, subtotal: -61.45, total: -61.45, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 16, codArt: 1, codCli: 12165, nombreCli: 'ROSI', apellidosCli: '', nombreArt: 'VARIOS', precio: 69, cantidad: 1, subtotal: 69, total: 69, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 17, codArt: 1, codCli: 12110, nombreCli: 'ROSI', apellidosCli: '', nombreArt: 'VARIOS', precio: 90.1, cantidad: 1, subtotal: 90.1, total: 90.1, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 18, codArt: 1, codCli: 12135, nombreCli: 'MUJER', apellidosCli: 'DE ROQUE', nombreArt: 'VARIOS', precio: 9.5, cantidad: 1, subtotal: 9.5, total: 9.5, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 19, codArt: 1, codCli: 12080, nombreCli: 'JULIA', apellidosCli: 'MELIAN TIA', nombreArt: 'VARIOS', precio: 169.3, cantidad: 1, subtotal: 169.3, total: 169.3, fechaCom: '2021-04-11', vista: 3, cod_user: 1 },
        { codCom: 20, codArt: 1, codCli: 13025, nombreCli: 'YAYI', apellidosCli: '', nombreArt: 'COLCHON', precio: 672.5, cantidad: 1, subtotal: 672.5, total: 672.5, fechaCom: '2021-04-19', vista: 3, cod_user: 1 },
        { codCom: 21, codArt: 1, codCli: 12025, nombreCli: 'Angela', apellidosCli: '', nombreArt: 'VARIOS', precio: 186.02, cantidad: 1, subtotal: 186.02, total: 186.02, fechaCom: '2021-04-19', vista: 3, cod_user: 1 },
        { codCom: 22, codArt: 1, codCli: 12025, nombreCli: 'Angela', apellidosCli: '', nombreArt: 'VARIOS', precio: 48.95, cantidad: 1, subtotal: 48.95, total: 234.97, fechaCom: '2021-04-19', vista: 3, cod_user: 1 },
        { codCom: 23, codArt: 1, codCli: 12115, nombreCli: 'FRANCISCA', apellidosCli: 'MORENO', nombreArt: 'VARIOS', precio: 94.35, cantidad: 1, subtotal: 94.35, total: 94.35, fechaCom: '2021-04-19', vista: 3, cod_user: 1 },
        { codCom: 24, codArt: 1, codCli: 12025, nombreCli: 'Angela', apellidosCli: '', nombreArt: 'VARIOS', precio: -68.8, cantidad: 1, subtotal: -68.8, total: -68.8, fechaCom: '2021-04-29', vista: 3, cod_user: 1 },
        { codCom: 25, codArt: 1, codCli: 5532, nombreCli: 'SARI', apellidosCli: 'ARMAS', nombreArt: 'RELLENO', precio: 6.5, cantidad: 1, subtotal: 6.5, total: 6.5, fechaCom: '2021-05-24', vista: 3, cod_user: 1 },
        { codCom: 26, codArt: 1, codCli: 12160, nombreCli: 'MERCEDES', apellidosCli: 'MARTIN', nombreArt: 'VARIOS', precio: 170.15, cantidad: 1, subtotal: 170.15, total: 170.15, fechaCom: '2021-05-24', vista: 3, cod_user: 1 },
        { codCom: 27, codArt: 1, codCli: 12005, nombreCli: 'Maria Rosa ', apellidosCli: 'Ferrera', nombreArt: 'VARIOS', precio: 415.6, cantidad: 1, subtotal: 415.6, total: 415.6, fechaCom: '2021-05-27', vista: 3, cod_user: 1 },
        { codCom: 28, codArt: 1, codCli: 12023, nombreCli: 'ANGELA HIJO', apellidosCli: '', nombreArt: 'VARIOS', precio: 206.4, cantidad: 1, subtotal: 206.4, total: 206.4, fechaCom: '2021-05-27', vista: 3, cod_user: 1 },
        { codCom: 29, codArt: 1, codCli: 4624, nombreCli: 'CARMITA PLACIOS', apellidosCli: '', nombreArt: 'VARIOS', precio: 75, cantidad: 1, subtotal: 75, total: 75, fechaCom: '2021-06-21', vista: 3, cod_user: 1 }
      ];
      
      await HistoricalSale.bulkCreate(historicalSalesData);
      console.log(`✅ Insertadas ${historicalSalesData.length} ventas históricas`);
    }
    
    if (existingPayments === 0) {
      console.log('💰 Insertando datos de pagos históricos...');
      
      const historicalPaymentsData = [
        { cod_cliente_p: 15151, nombre_c_p: 'prueba', apellidos_c_p: 'otra prueba', fecha_pago: '2021-01-16', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 1, vista: 3, cod_user: 1 },
        { cod_cliente_p: 2006, nombre_c_p: 'MABEL', apellidos_c_p: 'PACHECO', fecha_pago: '2021-01-23', tipo_de_pago: 'EFECTIVO', cantidad_pago: 50.00, cod_pago: 2, vista: 3, cod_user: 1 },
        { cod_cliente_p: 4, nombre_c_p: 'MARISA', apellidos_c_p: '', fecha_pago: '2021-01-23', tipo_de_pago: 'EFECTIVO', cantidad_pago: 75.45, cod_pago: 3, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12050, nombre_c_p: 'Maria Pepa', apellidos_c_p: 'Gamez Montesinos', fecha_pago: '2021-01-27', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 4, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12051, nombre_c_p: 'Amalia', apellidos_c_p: 'Zamora Gamez', fecha_pago: '2021-01-27', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 5, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12130, nombre_c_p: 'PURA ', apellidos_c_p: 'TRUJILLO', fecha_pago: '2021-01-27', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 6, vista: 3, cod_user: 1 },
        { cod_cliente_p: 4624, nombre_c_p: 'CARMITA PLACIOS', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 7, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12100, nombre_c_p: 'KELLY', apellidos_c_p: 'DE ARMAS', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 50.00, cod_pago: 8, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12010, nombre_c_p: 'Ana', apellidos_c_p: 'Perez', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 9, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12135, nombre_c_p: 'MUJER', apellidos_c_p: 'DE ROQUE', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 30.00, cod_pago: 10, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12080, nombre_c_p: 'JULIA', apellidos_c_p: 'MELIAN TIA', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 50.00, cod_pago: 11, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12155, nombre_c_p: 'LOLI', apellidos_c_p: '(COSTURERA)', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 90.00, cod_pago: 12, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12015, nombre_c_p: 'Candelaria', apellidos_c_p: 'Coello', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 30.00, cod_pago: 13, vista: 3, cod_user: 1 },
        { cod_cliente_p: 1012, nombre_c_p: 'ERNESTINA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 14, vista: 3, cod_user: 1 },
        { cod_cliente_p: 1013, nombre_c_p: 'ELISABETH CORREA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 40.00, cod_pago: 15, vista: 3, cod_user: 1 },
        { cod_cliente_p: 1014, nombre_c_p: 'JUANJO CORREA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 50.00, cod_pago: 16, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12220, nombre_c_p: 'ANDREA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 17, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12165, nombre_c_p: 'ROSI', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 18, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12250, nombre_c_p: 'VALENTINA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 19, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12230, nombre_c_p: 'CATALINA', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 20, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12120, nombre_c_p: 'Maite', apellidos_c_p: 'Melian Gonzalez', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 21, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12120, nombre_c_p: 'Maite', apellidos_c_p: 'Melian Gonzalez', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 7.00, cod_pago: 22, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12180, nombre_c_p: 'Celo', apellidos_c_p: '', fecha_pago: '2021-02-06', tipo_de_pago: 'EFECTIVO', cantidad_pago: 100.00, cod_pago: 23, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12105, nombre_c_p: 'ISABEL ', apellidos_c_p: '(TORINO)', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 24, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12035, nombre_c_p: 'Mabi', apellidos_c_p: 'Mejias', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 30.00, cod_pago: 25, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12110, nombre_c_p: 'ROSI', apellidos_c_p: '', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 26, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12095, nombre_c_p: 'ROSARIO MARGARITA', apellidos_c_p: '', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 27, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12030, nombre_c_p: 'Teresa', apellidos_c_p: 'Medina', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 30.00, cod_pago: 28, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12020, nombre_c_p: 'Marta', apellidos_c_p: '', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 20.00, cod_pago: 29, vista: 3, cod_user: 1 },
        { cod_cliente_p: 12025, nombre_c_p: 'Angela', apellidos_c_p: '', fecha_pago: '2021-02-17', tipo_de_pago: 'EFECTIVO', cantidad_pago: 50.00, cod_pago: 30, vista: 3, cod_user: 1 }
      ];
      
      await HistoricalPayment.bulkCreate(historicalPaymentsData);
      console.log(`✅ Insertados ${historicalPaymentsData.length} pagos históricos`);
    }
    
    // Verificar datos finales
    const finalSales = await HistoricalSale.count();
    const finalPayments = await HistoricalPayment.count();
    
    console.log('🎉 Migración completada exitosamente!');
    console.log(`📊 Total de registros: ${finalSales} ventas históricas, ${finalPayments} pagos históricos`);
    
    // Mostrar algunos ejemplos de datos
    const sampleSales = await HistoricalSale.findAll({ limit: 3 });
    const samplePayments = await HistoricalPayment.findAll({ limit: 3 });
    
    console.log('\n📋 Ejemplos de datos insertados:');
    console.log('Ventas:', sampleSales.map(s => `${s.nombreCli} - €${s.total} (${s.fechaCom})`));
    console.log('Pagos:', samplePayments.map(p => `${p.nombre_c_p} - €${p.cantidad_pago} (${p.fecha_pago})`));
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateHistoricalData()
    .then(() => {
      console.log('✅ Script de migración completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el script de migración:', error);
      process.exit(1);
    });
}

export default migrateHistoricalData;
