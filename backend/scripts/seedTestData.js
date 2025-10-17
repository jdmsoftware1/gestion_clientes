import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

async function seedTestData() {
  try {
    console.log('🌱 Creando datos de prueba...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 1. Crear vendedores de prueba
    console.log('\n👥 Creando vendedores...');
    const salespeople = await Salesperson.bulkCreate([
      { name: 'David', email: 'david@empresa.com' },
      { name: 'Bego', email: 'bego@empresa.com' },
      { name: 'Yaiza', email: 'yaiza@empresa.com' }
    ], { ignoreDuplicates: true });

    console.log(`   ✅ Creados ${salespeople.length} vendedores`);

    // Obtener todos los vendedores (incluyendo los que ya existían)
    const allSalespeople = await Salesperson.findAll();
    console.log(`   📊 Total vendedores en BD: ${allSalespeople.length}`);

    // 2. Crear clientes de prueba
    console.log('\n👤 Creando clientes...');
    const clientsData = [
      { name: 'María García', phone: '123456789', email: 'maria@email.com', address: 'Calle Mayor 1', internalCode: '001', salespersonId: allSalespeople[0].id },
      { name: 'Juan Pérez', phone: '987654321', email: 'juan@email.com', address: 'Avenida Central 2', internalCode: '002', salespersonId: allSalespeople[0].id },
      { name: 'Ana López', phone: '555666777', email: 'ana@email.com', address: 'Plaza España 3', internalCode: '003', salespersonId: allSalespeople[1].id },
      { name: 'Carlos Rodríguez', phone: '111222333', email: 'carlos@email.com', address: 'Calle Sol 4', internalCode: '004', salespersonId: allSalespeople[1].id },
      { name: 'Laura Martín', phone: '444555666', email: 'laura@email.com', address: 'Avenida Luna 5', internalCode: '005', salespersonId: allSalespeople[2].id }
    ];

    const clients = await Client.bulkCreate(clientsData, { ignoreDuplicates: true });
    console.log(`   ✅ Creados ${clients.length} clientes`);

    // Obtener todos los clientes
    const allClients = await Client.findAll();
    console.log(`   📊 Total clientes en BD: ${allClients.length}`);

    // 3. Crear ventas de prueba
    console.log('\n💰 Creando ventas...');
    const salesData = [];
    const now = new Date();
    
    // Ventas recientes (últimos 30 días)
    for (let i = 0; i < 20; i++) {
      const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const saleDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      salesData.push({
        amount: Math.round((Math.random() * 500 + 50) * 100) / 100, // Entre 50 y 550 euros
        description: `Venta ${i + 1} - Productos varios`,
        clientId: randomClient.id,
        createdAt: saleDate,
        updatedAt: saleDate
      });
    }

    // Ventas más antiguas
    for (let i = 0; i < 15; i++) {
      const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
      const randomDaysAgo = Math.floor(Math.random() * 180) + 31; // Entre 31 y 211 días atrás
      const saleDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      salesData.push({
        amount: Math.round((Math.random() * 800 + 100) * 100) / 100, // Entre 100 y 900 euros
        description: `Venta histórica ${i + 1}`,
        clientId: randomClient.id,
        createdAt: saleDate,
        updatedAt: saleDate
      });
    }

    const sales = await Sale.bulkCreate(salesData, { ignoreDuplicates: true });
    console.log(`   ✅ Creadas ${sales.length} ventas`);

    // 4. Crear pagos de prueba
    console.log('\n💳 Creando pagos...');
    const paymentsData = [];
    
    // Pagos recientes (últimos 30 días)
    for (let i = 0; i < 15; i++) {
      const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const paymentDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      paymentsData.push({
        amount: Math.round((Math.random() * 300 + 20) * 100) / 100, // Entre 20 y 320 euros
        paymentMethod: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'][Math.floor(Math.random() * 3)],
        clientId: randomClient.id,
        createdAt: paymentDate,
        updatedAt: paymentDate
      });
    }

    // Pagos más antiguos
    for (let i = 0; i < 10; i++) {
      const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
      const randomDaysAgo = Math.floor(Math.random() * 150) + 31; // Entre 31 y 181 días atrás
      const paymentDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      paymentsData.push({
        amount: Math.round((Math.random() * 400 + 50) * 100) / 100, // Entre 50 y 450 euros
        paymentMethod: ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'][Math.floor(Math.random() * 3)],
        clientId: randomClient.id,
        createdAt: paymentDate,
        updatedAt: paymentDate
      });
    }

    const payments = await Payment.bulkCreate(paymentsData, { ignoreDuplicates: true });
    console.log(`   ✅ Creados ${payments.length} pagos`);

    console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
    
    // Mostrar estadísticas finales
    const totalSalespeople = await Salesperson.count();
    const totalClients = await Client.count();
    const totalSales = await Sale.count();
    const totalPayments = await Payment.count();
    
    console.log('\n📈 Estadísticas finales:');
    console.log(`   - Vendedores: ${totalSalespeople}`);
    console.log(`   - Clientes: ${totalClients}`);
    console.log(`   - Ventas: ${totalSales}`);
    console.log(`   - Pagos: ${totalPayments}`);

    // Calcular algunas métricas
    const totalSalesAmount = await Sale.sum('amount');
    const totalPaymentsAmount = await Payment.sum('amount');
    const totalDebt = (totalSalesAmount || 0) - (totalPaymentsAmount || 0);
    
    console.log('\n💰 Métricas financieras:');
    console.log(`   - Total vendido: €${(totalSalesAmount || 0).toFixed(2)}`);
    console.log(`   - Total pagado: €${(totalPaymentsAmount || 0).toFixed(2)}`);
    console.log(`   - Deuda total: €${totalDebt.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar creación de datos de prueba
console.log('Iniciando creación de datos de prueba...');
seedTestData().catch(console.error);

export default seedTestData;
