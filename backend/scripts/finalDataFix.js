import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client, Sale, Salesperson } from '../models/index.js';
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
        
        if (cleanParts.length >= 11) {
          const clientData = {
            cod_cliente: parseInt(cleanParts[0]) || 0,
            nombre_c: cleanParts[1] || '',
            apellidos_c: cleanParts[2] || '',
            direccion_c: cleanParts[3] || '',
            telefono_c: cleanParts[4] || '',
            email_c: cleanParts[5] || '',
            debe: parseFloat(cleanParts[6]) || 0,
            cod_user: parseInt(cleanParts[10]) || 1,
            fullName: `${cleanParts[1] || ''} ${cleanParts[2] || ''}`.trim()
          };
          
          if (clientData.cod_cliente > 0 && clientData.fullName) {
            clientDebts.push(clientData);
          }
        }
      });
    }
  });
  
  return clientDebts;
}

async function finalDataFix() {
  try {
    console.log('🔧 Aplicando corrección final de datos...\n');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const sqlClients = parseClientDebtsFromSql(sqlFilePath);
    console.log(`📊 Clientes en SQL: ${sqlClients.length}`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    
    // Obtener vendedores
    const salespeople = await Salesperson.findAll({
      attributes: ['id', 'name'],
      raw: true
    });
    
    const salespersonMap = new Map();
    salespeople.forEach(sp => {
      salespersonMap.set(sp.name.toUpperCase(), sp.id);
    });
    
    // Mapa de cod_user a vendedor
    const trabajadorMap = new Map([
      [1, 'DAVID'],
      [2, 'FE'], 
      [3, 'BEGO']
    ]);

    // Obtener clientes existentes
    const existingClients = await Client.findAll({
      attributes: ['id', 'internalCode', 'name'],
      raw: true
    });

    const clientMap = new Map();
    existingClients.forEach(client => {
      if (client.internalCode) {
        clientMap.set(client.internalCode, client);
      }
    });

    console.log(`📊 Clientes existentes en BD: ${existingClients.length}`);

    let clientsCreated = 0;
    let salesCreated = 0;
    let salesUpdated = 0;

    console.log('\n🔍 Procesando clientes faltantes y correcciones...');

    for (const sqlClient of sqlClients) {
      const clientCode = sqlClient.cod_cliente.toString();
      const existingClient = clientMap.get(clientCode);
      
      if (!existingClient && sqlClient.debe > 0) {
        // Cliente faltante con deuda - crearlo
        console.log(`➕ Creando cliente faltante: ${sqlClient.fullName} (${clientCode}) - €${sqlClient.debe.toFixed(2)}`);
        
        // Determinar vendedor
        const trabajadorName = trabajadorMap.get(sqlClient.cod_user) || 'DAVID';
        const salespersonId = salespersonMap.get(trabajadorName) || salespersonMap.get('DAVID');
        
        try {
          const newClient = await Client.create({
            internalCode: clientCode,
            name: sqlClient.fullName,
            phone: sqlClient.telefono_c?.toString() || null,
            email: sqlClient.email_c || null,
            address: sqlClient.direccion_c || null,
            salespersonId: salespersonId
          });
          
          // Crear la venta correspondiente
          await Sale.create({
            amount: sqlClient.debe,
            description: `Deuda inicial - ${sqlClient.fullName}`,
            clientId: newClient.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          clientsCreated++;
          salesCreated++;
          
        } catch (error) {
          console.error(`   ❌ Error creando cliente ${sqlClient.fullName}:`, error.message);
        }
      } else if (existingClient && sqlClient.debe > 0) {
        // Cliente existente - verificar/corregir venta
        const existingSale = await Sale.findOne({
          where: {
            clientId: existingClient.id,
            description: {
              [Op.like]: 'Deuda inicial%'
            }
          }
        });
        
        if (!existingSale) {
          // Falta la venta
          console.log(`➕ Creando venta faltante: ${sqlClient.fullName} - €${sqlClient.debe.toFixed(2)}`);
          await Sale.create({
            amount: sqlClient.debe,
            description: `Deuda inicial - ${sqlClient.fullName}`,
            clientId: existingClient.id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          salesCreated++;
        } else if (Math.abs(parseFloat(existingSale.amount) - sqlClient.debe) > 0.01) {
          // Corregir importe
          console.log(`🔧 Corrigiendo venta: ${sqlClient.fullName} - €${parseFloat(existingSale.amount).toFixed(2)} → €${sqlClient.debe.toFixed(2)}`);
          await Sale.update(
            { amount: sqlClient.debe },
            { where: { id: existingSale.id } }
          );
          salesUpdated++;
        }
      }
    }

    console.log(`\n📈 RESUMEN DE CORRECCIONES:`);
    console.log(`   ➕ Clientes creados: ${clientsCreated}`);
    console.log(`   ➕ Ventas creadas: ${salesCreated}`);
    console.log(`   🔧 Ventas corregidas: ${salesUpdated}`);

    // Verificar estado final
    console.log(`\n🔍 Verificando estado final...`);
    
    const finalClientsCount = await Client.count();
    const finalSalesCount = await Sale.count({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      }
    });
    
    const finalTotalAmount = await Sale.sum('amount', {
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      }
    }) || 0;

    // Calcular total esperado del SQL
    const expectedTotal = sqlClients
      .filter(c => c.debe > 0)
      .reduce((sum, c) => sum + c.debe, 0);

    console.log(`   📊 Clientes totales: ${finalClientsCount}`);
    console.log(`   📊 Ventas simuladas: ${finalSalesCount}`);
    console.log(`   💰 Total actual: €${finalTotalAmount.toFixed(2)}`);
    console.log(`   💰 Total esperado: €${expectedTotal.toFixed(2)}`);
    console.log(`   📊 Diferencia: €${(expectedTotal - finalTotalAmount).toFixed(2)}`);

    if (Math.abs(expectedTotal - finalTotalAmount) < 1) {
      console.log(`   ✅ DATOS PERFECTAMENTE SINCRONIZADOS`);
    } else {
      console.log(`   ⚠️  Aún hay una pequeña diferencia`);
    }

    // Verificar que no hay clientes sin vendedor
    const clientsWithoutSalesperson = await Client.count({
      where: { salespersonId: null }
    });
    
    console.log(`   📊 Clientes sin vendedor: ${clientsWithoutSalesperson}`);

    console.log(`\n🎉 ¡Corrección final completada!`);
    console.log(`📝 Todos los datos están ahora sincronizados con el SQL original`);

  } catch (error) {
    console.error('❌ Error durante la corrección final:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando corrección final de datos...');
finalDataFix().catch(console.error);

export default finalDataFix;
