import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client, Sale } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer las deudas reales
function parseClientDebtsFromSql(filePath) {
  console.log('📖 Leyendo archivo SQL para extraer deudas...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extraer datos de clientes con sus deudas
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
            debe: parseFloat(cleanParts[6]) || 0, // La deuda está en la posición 6
            cod_user: parseInt(cleanParts[10]) || 1
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

async function createDebtSales() {
  try {
    console.log('🚀 Iniciando creación de ventas basadas en deudas del SQL...');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const clientDebts = parseClientDebtsFromSql(sqlFilePath);
    console.log(`📊 Encontradas ${clientDebts.length} deudas de clientes en el SQL`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener todos los clientes actuales de la BD
    const existingClients = await Client.findAll({
      attributes: ['id', 'internalCode', 'name'],
      raw: true
    });

    console.log(`📊 Clientes en BD: ${existingClients.length}`);

    // Crear un mapa de código interno -> cliente
    const clientMap = new Map();
    existingClients.forEach(client => {
      if (client.internalCode) {
        clientMap.set(client.internalCode, client);
      }
    });

    let salesCreated = 0;
    let salesSkipped = 0;
    const currentDate = new Date(); // Fecha actual para todas las ventas

    console.log('\n💰 Creando ventas basadas en deudas...');

    for (const debtData of clientDebts) {
      try {
        // Buscar el cliente por su código interno
        const client = clientMap.get(debtData.cod_cliente.toString());
        
        if (!client) {
          console.log(`   ⚠️  Cliente con código ${debtData.cod_cliente} no encontrado en BD`);
          salesSkipped++;
          continue;
        }

        // Solo crear venta si la deuda es mayor que 0
        if (debtData.debe <= 0) {
          console.log(`   ⚠️  Cliente ${client.name} no tiene deuda (${debtData.debe})`);
          salesSkipped++;
          continue;
        }

        // Crear la venta con la deuda exacta
        await Sale.create({
          amount: debtData.debe,
          description: `Deuda inicial - ${client.name}`,
          clientId: client.id,
          createdAt: currentDate,
          updatedAt: currentDate
        });

        salesCreated++;
        
        if (salesCreated % 50 === 0) {
          console.log(`   📊 Procesadas ${salesCreated} ventas...`);
        }

      } catch (error) {
        console.error(`   ❌ Error creando venta para cliente ${debtData.cod_cliente}:`, error.message);
        salesSkipped++;
      }
    }

    console.log(`\n✅ Ventas creadas: ${salesCreated}`);
    console.log(`⚠️  Ventas saltadas: ${salesSkipped}`);

    // Mostrar estadísticas finales
    const totalSales = await Sale.count();
    const totalSalesAmount = await Sale.sum('amount') || 0;
    
    console.log('\n📈 Estadísticas finales:');
    console.log(`   - Total ventas en BD: ${totalSales}`);
    console.log(`   - Importe total: €${totalSalesAmount.toFixed(2)}`);

    // Verificar algunos clientes con deuda
    console.log('\n🔍 Verificando algunos clientes con deuda:');
    const clientsWithDebt = await sequelize.query(`
      SELECT c.name, c.internal_code, COALESCE(SUM(s.amount), 0) as debt
      FROM clients c
      LEFT JOIN sales s ON c.id = s.client_id
      GROUP BY c.id, c.name, c.internal_code
      HAVING COALESCE(SUM(s.amount), 0) > 0
      ORDER BY debt DESC
      LIMIT 5
    `, { type: sequelize.QueryTypes.SELECT });

    clientsWithDebt.forEach(client => {
      console.log(`   - ${client.name} (${client.internal_code}): €${parseFloat(client.debt).toFixed(2)}`);
    });

    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log('📝 Ahora cada cliente tiene exactamente la deuda que tenía en el SQL original');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando creación de ventas basadas en deudas...');
createDebtSales().catch(console.error);

export default createDebtSales;
