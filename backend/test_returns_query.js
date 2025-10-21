import { Return, Client, Salesperson } from './models/index.js';
import sequelize from './config/database.js';

(async () => {
  try {
    console.log('🔍 Probando consulta de returns...');

    const testSalespersonId = '579588ae-1fd0-4d7d-8227-8c89490d72c9';

    const returns = await Return.findAll({
      include: [{
        model: Client,
        as: 'client',
        where: { salespersonId: testSalespersonId },
        required: true,
        include: [{ model: Salesperson, as: 'salesperson' }]
      }],
      order: [['created_at', 'DESC']]
    });

    console.log(`✅ Consulta exitosa: ${returns.length} returns encontrados`);

    if (returns.length > 0) {
      console.log('📋 Primer return:', {
        id: returns[0].id,
        amount: returns[0].amount,
        description: returns[0].description,
        client: returns[0].client ? {
          id: returns[0].client.id,
          name: returns[0].client.name,
          salespersonId: returns[0].client.salespersonId
        } : null
      });
    }

  } catch (error) {
    console.error('❌ Error en la consulta:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await sequelize.close();
  }
})();
