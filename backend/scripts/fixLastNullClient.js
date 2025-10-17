import sequelize from '../config/database.js';
import { Client, Salesperson } from '../models/index.js';

async function fixLastNullClient() {
  try {
    console.log('🔧 Corrigiendo último cliente con salespersonId null...');
    
    await sequelize.authenticate();
    
    // Buscar todos los clientes con salespersonId null
    const nullClients = await Client.findAll({
      where: { salespersonId: null },
      attributes: ['id', 'name', 'internalCode']
    });
    
    if (nullClients.length === 0) {
      console.log('✅ No hay clientes con salespersonId null');
      return;
    }
    
    console.log(`📋 Clientes encontrados: ${nullClients.length}`);
    
    // Buscar a David
    const david = await Salesperson.findOne({
      where: { name: 'David' },
      attributes: ['id', 'name']
    });
    
    if (!david) {
      console.log('❌ No se encontró el vendedor David');
      return;
    }
    
    // Asignar David a todos los clientes null
    for (const client of nullClients) {
      await Client.update(
        { salespersonId: david.id },
        { where: { id: client.id } }
      );
      console.log(`✅ Cliente ${client.name} (${client.internalCode}) asignado a ${david.name}`);
    }
    
    // Verificar que no queden clientes sin asignar
    const remainingNullClients = await Client.count({
      where: { salespersonId: null }
    });
    
    console.log(`📊 Clientes restantes sin vendedor: ${remainingNullClients}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixLastNullClient();
