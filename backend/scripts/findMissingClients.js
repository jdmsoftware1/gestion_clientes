import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer todos los clientes
function parseAllClientsFromSql(filePath) {
  console.log('📖 Leyendo archivo SQL para extraer todos los clientes...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const clientsRegex = /INSERT INTO `clientes`[^;]+;/gs;
  const clientsMatches = content.match(clientsRegex);
  
  if (!clientsMatches) {
    console.log('❌ No se encontraron datos de clientes en el SQL');
    return [];
  }

  const allClients = [];
  
  clientsMatches.forEach(match => {
    const valuesRegex = /\([^)]+\)/g;
    const values = match.match(valuesRegex);
    
    if (values) {
      values.forEach(value => {
        const cleanValue = value.replace(/[()]/g, '');
        const parts = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < cleanValue.length; i++) {
          const char = cleanValue[i];
          
          if ((char === "'" || char === '"') && !inQuotes) {
            inQuotes = true;
            quoteChar = char;
          } else if (char === quoteChar && inQuotes) {
            if (i > 0 && cleanValue[i-1] === '\\') {
              current += char;
            } else {
              inQuotes = false;
              quoteChar = '';
            }
          } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        parts.push(current.trim());
        
        // Limpiar las partes
        const cleanParts = parts.map(part => {
          const trimmed = part.trim();
          if (trimmed === 'NULL' || trimmed === '') return null;
          if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
              (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed.slice(1, -1);
          }
          return trimmed;
        });
        
        if (cleanParts.length >= 7) {
          const clientData = {
            cod_cliente: parseInt(cleanParts[0]) || 0,
            nombre_c: cleanParts[1] || '',
            apellidos_c: cleanParts[2] || '',
            debe: parseFloat(cleanParts[6]) || 0,
            fullName: `${cleanParts[1] || ''} ${cleanParts[2] || ''}`.trim()
          };
          
          if (clientData.cod_cliente > 0 && clientData.fullName) {
            allClients.push(clientData);
          }
        }
      });
    }
  });
  
  return allClients;
}

async function findMissingClients() {
  try {
    console.log('🔍 Buscando clientes faltantes...\n');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const sqlClients = parseAllClientsFromSql(sqlFilePath);
    console.log(`📊 Clientes en SQL: ${sqlClients.length}`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    
    // Obtener todos los clientes de la BD
    const dbClients = await Client.findAll({
      attributes: ['internalCode', 'name'],
      raw: true
    });

    console.log(`📊 Clientes en BD: ${dbClients.length}`);

    // Crear mapa de clientes en BD
    const dbClientMap = new Map();
    dbClients.forEach(client => {
      if (client.internalCode) {
        dbClientMap.set(client.internalCode, client);
      }
    });

    // Encontrar clientes faltantes
    const missingClients = [];
    const missingWithDebt = [];
    let totalMissingDebt = 0;

    for (const sqlClient of sqlClients) {
      const exists = dbClientMap.has(sqlClient.cod_cliente.toString());
      
      if (!exists) {
        missingClients.push(sqlClient);
        
        if (sqlClient.debe > 0) {
          missingWithDebt.push(sqlClient);
          totalMissingDebt += sqlClient.debe;
        }
      }
    }

    console.log(`\n📊 RESUMEN:`);
    console.log(`   - Clientes faltantes: ${missingClients.length}`);
    console.log(`   - Clientes faltantes con deuda: ${missingWithDebt.length}`);
    console.log(`   - Deuda total faltante: €${totalMissingDebt.toFixed(2)}`);

    if (missingWithDebt.length > 0) {
      console.log(`\n💰 CLIENTES FALTANTES CON DEUDA (Top 10):`);
      missingWithDebt
        .sort((a, b) => b.debe - a.debe)
        .slice(0, 10)
        .forEach(client => {
          console.log(`   - ${client.fullName} (${client.cod_cliente}): €${client.debe.toFixed(2)}`);
        });
    }

    if (missingClients.length > 0) {
      console.log(`\n📝 CLIENTES FALTANTES SIN DEUDA (primeros 10):`);
      missingClients
        .filter(c => c.debe <= 0)
        .slice(0, 10)
        .forEach(client => {
          console.log(`   - ${client.fullName} (${client.cod_cliente}): €${client.debe.toFixed(2)}`);
        });
    }

    // Verificar si la diferencia coincide
    console.log(`\n🔍 ANÁLISIS DE DIFERENCIA:`);
    console.log(`   - Diferencia reportada: €3,843.42`);
    console.log(`   - Deuda faltante calculada: €${totalMissingDebt.toFixed(2)}`);
    
    if (Math.abs(totalMissingDebt - 3843.42) < 1) {
      console.log(`   ✅ LA DIFERENCIA COINCIDE - Los clientes faltantes explican la diferencia`);
    } else {
      console.log(`   ⚠️  La diferencia no coincide exactamente`);
    }

    // Mostrar algunos ejemplos de clientes que SÍ están en BD
    console.log(`\n✅ EJEMPLOS DE CLIENTES QUE SÍ ESTÁN EN BD:`);
    sqlClients
      .filter(c => dbClientMap.has(c.cod_cliente.toString()) && c.debe > 0)
      .slice(0, 5)
      .forEach(client => {
        console.log(`   - ${client.fullName} (${client.cod_cliente}): €${client.debe.toFixed(2)}`);
      });

  } catch (error) {
    console.error('❌ Error durante la búsqueda:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando búsqueda de clientes faltantes...');
findMissingClients().catch(console.error);

export default findMissingClients;
