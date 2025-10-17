import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Salesperson } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to migrate clients from old MariaDB tiendaNew database to new PostgreSQL database
 * Usage: node scripts/migrateFromOldDB.js
 */

async function migrateClients() {
  try {
    console.log('🚀 Starting migration from old database...');

    // Read SQL dump file
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('❌ SQL file not found at:', sqlFilePath);
      process.exit(1);
    }

    // Parse SQL file to extract client data
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    const clients = parseClientsFromSQL(sqlContent);

    console.log(`✅ Found ${clients.length} clients in SQL file`);

    // Get or create default salesperson for imports
    let defaultSalesperson = await Salesperson.findOne({
      where: { name: 'Importado' }
    });

    if (!defaultSalesperson) {
      defaultSalesperson = await Salesperson.create({
        name: 'Importado',
      });
      console.log('📝 Created default salesperson for imports');
    }
    
    if (!defaultSalesperson || !defaultSalesperson.id) {
      console.error('❌ Failed to create or retrieve default salesperson');
      process.exit(1);
    }
    
    console.log(`✅ Using salesperson ID: ${defaultSalesperson.id}`);

    // Clear existing clients (since user wants to replace)
    const deletedCount = await Client.destroy({ where: {} });
    console.log(`🗑️  Cleared ${deletedCount} existing clients`);

    // Get existing internal codes (to avoid duplicates)
    const existingClients = await Client.findAll({
      attributes: ['internalCode'],
      raw: true,
    });
    const existingCodes = new Set(existingClients.map(c => c.internalCode));

    // Prepare clients for bulk insert (only new ones)
    const clientsToInsert = clients
      .filter(c => !existingCodes.has(c.internalCode))
      .map(c => ({
        internalCode: c.internalCode,
        name: c.name || 'Sin nombre',
        phone: c.phone || null,
        email: c.email || null,
        address: c.address || null,
        salespersonId: defaultSalesperson.id,
      }));

    console.log(`📊 Found ${existingCodes.size} existing clients`);
    console.log(`📥 Importing ${clientsToInsert.length} new clients...`);

    // Bulk insert in batches
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < clientsToInsert.length; i += batchSize) {
      const batch = clientsToInsert.slice(i, i + batchSize);
      try {
        const inserted = await Client.bulkCreate(batch, { 
          ignoreDuplicates: true,
          returning: false,
        });
        successCount += inserted.length;
        process.stdout.write(`\r✅ Imported ${successCount}/${clientsToInsert.length} clients`);
      } catch (err) {
        // If batch fails, try individual inserts to salvage what we can
        for (const client of batch) {
          try {
            await Client.create(client);
            successCount++;
            process.stdout.write(`\r✅ Imported ${successCount}/${clientsToInsert.length} clients`);
          } catch (itemErr) {
            errorCount++;
          }
        }
      }
    }

    console.log(`\n\n✅ Migration completed!`);
    console.log(`   - Successfully imported: ${successCount} clients`);
    console.log(`   - Errors: ${errorCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Parse clients from SQL INSERT statements
 */
function parseClientsFromSQL(sqlContent) {
  const clients = [];
  
  // Find the INSERT INTO clientes statement
  const insertRegex = /INSERT INTO `clientes`[\s\S]*?VALUES([\s\S]*?);/i;
  const match = sqlContent.match(insertRegex);
  
  if (!match) {
    console.warn('⚠️  No clientes data found in SQL file');
    return clients;
  }

  const valuesString = match[1];
  // Split by ), ( to get individual records
  const records = valuesString.match(/\([^)]+\)/g) || [];

  records.forEach((record, idx) => {
    try {
      // Remove parentheses and parse values
      const values = record.slice(1, -1).split(',').map(v => {
        v = v.trim();
        // Handle NULL
        if (v.toUpperCase() === 'NULL') return null;
        // Remove quotes
        if (v.startsWith("'") && v.endsWith("'")) {
          return v.slice(1, -1).trim();
        }
        return v;
      });

      // Map to client object (following tiendaNew structure)
      // Columns: cod_cliente, nombre_c, apellidos_c, direccion_c, telefono_c, email_c, debe, fecha_creación, ult_fecha_pago, DNI_NIF, cod_user
      const client = {
        internalCode: String(values[0]), // cod_cliente
        name: values[1] ? values[1].toUpperCase().trim() : 'Sin nombre', // nombre_c
        address: values[3] || null, // direccion_c
        phone: values[4] ? String(values[4]) : null, // telefono_c
        email: values[5] || null, // email_c
      };

      // Validate required fields
      if (client.internalCode && client.name) {
        clients.push(client);
      }
    } catch (err) {
      console.warn(`⚠️  Warning parsing record ${idx}:`, err.message);
    }
  });

  return clients;
}

migrateClients();