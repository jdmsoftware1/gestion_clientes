import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🚀 Conectando a la base de datos Neon...');
    await sequelize.authenticate();
    console.log('✅ Conectado exitosamente');

    console.log('\n🗑️  Borrando todas las tablas...');
    await sequelize.query('DROP TABLE IF EXISTS "payments" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "sales" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "clients" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "salespeople" CASCADE;');
    console.log('✅ Tablas borradas');

    console.log('\n📋 Creando nuevas tablas...');

    // SALESPEOPLE
    await sequelize.query(`
      CREATE TABLE "salespeople" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) UNIQUE,
        "internal_code" VARCHAR(255) UNIQUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla salespeople creada');

    // CLIENTS
    await sequelize.query(`
      CREATE TABLE "clients" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "internal_code" VARCHAR(255) UNIQUE,
        "name" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(255),
        "email" VARCHAR(255),
        "address" VARCHAR(255),
        "salesperson_id" UUID REFERENCES "salespeople"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla clients creada');

    // SALES
    await sequelize.query(`
      CREATE TABLE "sales" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "amount" DECIMAL(12, 2) NOT NULL,
        "description" VARCHAR(255) NOT NULL,
        "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla sales creada');

    // PAYMENTS
    await sequelize.query(`
      CREATE TABLE "payments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "amount" DECIMAL(12, 2) NOT NULL,
        "payment_method" VARCHAR(255) NOT NULL,
        "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla payments creada');

    // INDEXES
    console.log('\n🔍 Creando índices...');
    await sequelize.query('CREATE INDEX "idx_clients_salesperson_id" ON "clients"("salesperson_id");');
    await sequelize.query('CREATE INDEX "idx_sales_client_id" ON "sales"("client_id");');
    await sequelize.query('CREATE INDEX "idx_payments_client_id" ON "payments"("client_id");');
    console.log('✅ Índices creados');

    // INSERT DEFAULT SALESPERSON
    console.log('\n👤 Insertando vendedor por defecto "Importado"...');
    await sequelize.query(`
      INSERT INTO "salespeople" ("name", "created_at", "updated_at") 
      VALUES ('Importado', NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Vendedor "Importado" insertado');

    console.log('\n✨ Base de datos limpiada y lista para migración');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanDatabase();