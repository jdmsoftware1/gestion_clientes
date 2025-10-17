import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client, Sale } from '../models/index.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer las deudas exactas
function parseClientDebtsFromSql(filePath) {
  console.log('📖 Leyendo archivo SQL para extraer deudas exactas...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const clientsRegex = /INSERT INTO `clientes`[^;]+;/gs;
  const clientsMatches = content.match(clientsRegex);
  
  if (!clientsMatches) {
    console.log('❌ No se encontraron datos de clientes en el SQL');
    return [];
  }

  const clientDebts = [];
  
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
          
          if (clientData.cod_cliente > 0) {
            clientDebts.push(clientData);
          }
        }
      });
    }
  });
  
  return clientDebts;
}

async function compareExactDebts() {
  try {
    console.log('🔍 Comparando deudas exactas SQL vs BD...\n');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const sqlDebts = parseClientDebtsFromSql(sqlFilePath);
    console.log(`📊 Deudas en SQL: ${sqlDebts.length}`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    
    // Obtener todas las ventas simuladas con sus clientes
    const salesWithClients = await Sale.findAll({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      },
      include: [
        { model: Client, as: 'client', attributes: ['internalCode', 'name'] }
      ],
      raw: true,
      nest: true
    });

    console.log(`📊 Ventas simuladas en BD: ${salesWithClients.length}`);

    // Crear mapas para comparación
    const sqlDebtMap = new Map();
    const bdDebtMap = new Map();

    // Procesar deudas del SQL
    let sqlTotalWithDebt = 0;
    let sqlClientsWithDebt = 0;
    
    sqlDebts.forEach(client => {
      if (client.debe > 0) {
        sqlDebtMap.set(client.cod_cliente.toString(), {
          name: client.fullName,
          debt: client.debe
        });
        sqlTotalWithDebt += client.debe;
        sqlClientsWithDebt++;
      }
    });

    // Procesar ventas de la BD
    let bdTotalWithDebt = 0;
    let bdClientsWithDebt = 0;
    
    salesWithClients.forEach(sale => {
      if (sale.client?.internalCode && sale.amount > 0) {
        bdDebtMap.set(sale.client.internalCode, {
          name: sale.client.name,
          debt: parseFloat(sale.amount)
        });
        bdTotalWithDebt += parseFloat(sale.amount);
        bdClientsWithDebt++;
      }
    });

    console.log(`\n📊 TOTALES:`);
    console.log(`   SQL - Clientes con deuda: ${sqlClientsWithDebt}, Total: €${sqlTotalWithDebt.toFixed(2)}`);
    console.log(`   BD  - Clientes con deuda: ${bdClientsWithDebt}, Total: €${bdTotalWithDebt.toFixed(2)}`);
    console.log(`   Diferencia: €${(sqlTotalWithDebt - bdTotalWithDebt).toFixed(2)}`);

    // Encontrar discrepancias
    const discrepancies = [];
    const missingInBD = [];
    const extraInBD = [];

    // Verificar cada cliente del SQL
    for (const [codCliente, sqlData] of sqlDebtMap) {
      const bdData = bdDebtMap.get(codCliente);
      
      if (!bdData) {
        missingInBD.push({
          code: codCliente,
          name: sqlData.name,
          sqlDebt: sqlData.debt,
          bdDebt: 0
        });
      } else if (Math.abs(sqlData.debt - bdData.debt) > 0.01) {
        discrepancies.push({
          code: codCliente,
          name: sqlData.name,
          sqlDebt: sqlData.debt,
          bdDebt: bdData.debt,
          difference: sqlData.debt - bdData.debt
        });
      }
    }

    // Verificar clientes extra en BD
    for (const [codCliente, bdData] of bdDebtMap) {
      if (!sqlDebtMap.has(codCliente)) {
        extraInBD.push({
          code: codCliente,
          name: bdData.name,
          sqlDebt: 0,
          bdDebt: bdData.debt
        });
      }
    }

    console.log(`\n🔍 ANÁLISIS DETALLADO:`);
    console.log(`   - Discrepancias en importes: ${discrepancies.length}`);
    console.log(`   - Faltantes en BD: ${missingInBD.length}`);
    console.log(`   - Extra en BD: ${extraInBD.length}`);

    if (discrepancies.length > 0) {
      console.log(`\n💰 DISCREPANCIAS EN IMPORTES (Top 10):`);
      discrepancies
        .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
        .slice(0, 10)
        .forEach(item => {
          console.log(`   - ${item.name} (${item.code}): SQL €${item.sqlDebt.toFixed(2)} vs BD €${item.bdDebt.toFixed(2)} (Dif: €${item.difference.toFixed(2)})`);
        });
    }

    if (missingInBD.length > 0) {
      console.log(`\n❌ FALTANTES EN BD (Top 10):`);
      missingInBD
        .sort((a, b) => b.sqlDebt - a.sqlDebt)
        .slice(0, 10)
        .forEach(item => {
          console.log(`   - ${item.name} (${item.code}): €${item.sqlDebt.toFixed(2)}`);
        });
    }

    if (extraInBD.length > 0) {
      console.log(`\n➕ EXTRA EN BD (Top 10):`);
      extraInBD
        .sort((a, b) => b.bdDebt - a.bdDebt)
        .slice(0, 10)
        .forEach(item => {
          console.log(`   - ${item.name} (${item.code}): €${item.bdDebt.toFixed(2)}`);
        });
    }

    // Calcular la diferencia explicada
    const discrepancyTotal = discrepancies.reduce((sum, item) => sum + item.difference, 0);
    const missingTotal = missingInBD.reduce((sum, item) => sum + item.sqlDebt, 0);
    const extraTotal = extraInBD.reduce((sum, item) => sum - item.bdDebt, 0);
    const explainedDifference = discrepancyTotal + missingTotal + extraTotal;

    console.log(`\n🧮 EXPLICACIÓN DE LA DIFERENCIA:`);
    console.log(`   - Por discrepancias: €${discrepancyTotal.toFixed(2)}`);
    console.log(`   - Por faltantes: €${missingTotal.toFixed(2)}`);
    console.log(`   - Por extras: €${extraTotal.toFixed(2)}`);
    console.log(`   - Total explicado: €${explainedDifference.toFixed(2)}`);
    console.log(`   - Diferencia real: €${(sqlTotalWithDebt - bdTotalWithDebt).toFixed(2)}`);

    if (Math.abs(explainedDifference - (sqlTotalWithDebt - bdTotalWithDebt)) < 0.01) {
      console.log(`   ✅ LA DIFERENCIA ESTÁ COMPLETAMENTE EXPLICADA`);
    } else {
      console.log(`   ⚠️  Hay una diferencia no explicada de €${(explainedDifference - (sqlTotalWithDebt - bdTotalWithDebt)).toFixed(2)}`);
    }

  } catch (error) {
    console.error('❌ Error durante la comparación:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando comparación exacta de deudas...');
compareExactDebts().catch(console.error);

export default compareExactDebts;
