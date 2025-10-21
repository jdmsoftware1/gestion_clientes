import sequelize from './config/database.js';

(async () => {
  try {
    console.log('🔍 Verificando tabla returns...');

    const [results] = await sequelize.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'returns'`);

    if (results.length > 0) {
      console.log('✅ La tabla returns existe');

      // Verificar estructura de la tabla
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'returns'
        ORDER BY ordinal_position
      `);

      console.log('📋 Estructura de la tabla returns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
      });

    } else {
      console.log('❌ La tabla returns NO existe - creando...');

      // Crear la tabla
      await sequelize.query(`
        CREATE TABLE returns (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          amount DECIMAL(10,2) NOT NULL,
          description TEXT NOT NULL,
          return_reason VARCHAR(255) DEFAULT 'Devolución de producto',
          client_id UUID NOT NULL REFERENCES clients(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Tabla returns creada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();
