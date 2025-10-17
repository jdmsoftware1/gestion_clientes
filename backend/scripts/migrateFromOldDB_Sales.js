import fs from 'fs';
import { Client, Sale, Salesperson } from '../models/index.js';
import sequelize from '../config/database.js';

// Parse SQL INSERT statements to extract data
function parseSQLInserts(sqlContent, tableName) {
  const records = [];
  
  // Find all INSERT INTO statements for this table
  const insertRegex = new RegExp(`INSERT INTO \`${tableName}\`.*?VALUES\\s*([^;]+);`, 'gi');
  let match;
  
  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const valuesSection = match[1];
    parseValueLines(valuesSection, records);
  }
  
  return records;
}

function parseValueLines(valueString, records) {
  // This regex matches tuples with all their content (handling nested quotes)
  const tuplePattern = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
  let match;
  
  while ((match = tuplePattern.exec(valueString)) !== null) {
    const tupleContent = match[1];
    const values = parseCommaSeparatedValues(tupleContent);
    records.push(values);
  }
}

function parseCommaSeparatedValues(content) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  let escapeNext = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    
    if (escapeNext) {
      current += char;
      escapeNext = false;
    } else if (char === '\\') {
      current += char;
      escapeNext = true;
    } else if (char === "'" && (inQuotes || current.trim() === '')) {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  // Clean up quoted values
  return parts.map(p => {
    if (p === 'NULL') return null;
    if (p.startsWith("'") && p.endsWith("'")) {
      return p.slice(1, -1).replace(/\\'/g, "'");
    }
    if (!isNaN(p)) {
      return parseFloat(p);
    }
    return p;
  });
}

async function migrateSales() {
  try {
    console.log('🚀 Starting sales migration from old database...');
    
    // Read SQL file
    const sqlContent = fs.readFileSync(
      '../tiendaNew(2).sql',
      'utf8'
    );
    
    // Parse comprasb table data
    const salesData = parseSQLInserts(sqlContent, 'comprasb');
    console.log(`✅ Found ${salesData.length} sales records in SQL file`);
    
    // Get or create "Importado" salesperson
    let importedSalesperson = await Salesperson.findOne({
      where: { name: 'Importado' },
    });
    
    if (!importedSalesperson) {
      importedSalesperson = await Salesperson.create({
        name: 'Importado',
        email: 'imported@system.local',
      });
      console.log('📝 Created "Importado" salesperson');
    }
    
    // Clear existing sales (optional - comment out to keep existing)
    // await Sale.destroy({ where: {} });
    // console.log('🗑️  Cleared existing sales');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each sales record
    for (const record of salesData) {
      try {
        // comprasb columns: codCom, codArt, codCli, nombreCli, apellidosCli, nombreArt, precio, cantidad, subtotal, total, fechaCom, vista, cod_user
        const [codCom, codArt, codCli, nombreCli, apellidosCli, nombreArt, precio, cantidad, subtotal, total, fechaCom, vista, cod_user] = record;
        
        // Skip if missing critical data
        if (!codCli || !nombreArt || !precio || !total || !fechaCom) {
          console.warn(`⚠️  Skipping sale ${codCom}: missing critical data`);
          errorCount++;
          continue;
        }
        
        // Find client by internalCode (which was cod_cliente)
        const client = await Client.findOne({
          where: { internalCode: String(codCli) }
        });
        
        if (!client) {
          console.warn(`⚠️  Skipping sale ${codCom}: client with internalCode ${codCli} not found`);
          errorCount++;
          continue;
        }
        
        // Determine salesperson - map cod_user to salesperson
        let salesperson = importedSalesperson;
        if (cod_user && cod_user !== '1') {
          const sp = await Salesperson.findOne({
            where: { internalCode: String(cod_user) }
          });
          if (sp) salesperson = sp;
        }
        
        // Create sale record
        const description = `${nombreArt} (Qty: ${cantidad})`;
        const amount = parseFloat(total) || parseFloat(subtotal);
        
        await Sale.create({
          clientId: client.id,
          salespersonId: salesperson.id,
          amount: amount,
          description: description,
          createdAt: new Date(fechaCom),
          updatedAt: new Date(fechaCom),
        });
        
        successCount++;
      } catch (error) {
        console.error(`❌ Error importing sale ${record[0]}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`   - Successfully imported: ${successCount} sales`);
    console.log(`   - Errors: ${errorCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateSales();