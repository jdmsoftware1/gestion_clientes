import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client, Sale } from '../models/index.js';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer las deudas reales
function parseClientDebtsFromSql(filePath) {
  console.log('📖 Leyendo archivo SQL para extraer deudas originales...');
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
            debe: parseFloat(cleanParts[6]) || 0
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

async function verifyAndFixSales() {
  try {
    console.log('🔧 Verificando y corrigiendo ventas simuladas...\n');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const clientDebts = parseClientDebtsFromSql(sqlFilePath);
    console.log(`📊 Deudas originales encontradas: ${clientDebts.length}`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener todos los clientes actuales
    const clients = await Client.findAll({
      attributes: ['id', 'internalCode', 'name'],
      raw: true
    });

    console.log(`📊 Clientes en BD: ${clients.length}`);

    // Crear mapa de código interno -> cliente
    const clientMap = new Map();
    clients.forEach(client => {
      if (client.internalCode) {
        clientMap.set(client.internalCode, client);
      }
    });

    // Obtener todas las ventas simuladas actuales
    const currentSales = await Sale.findAll({
      where: {
        description: {
          [Op.like]: 'Deuda inicial%'
        }
      },
      include: [
        { model: Client, as: 'client', attributes: ['internalCode', 'name'] }
      ]
    });

    console.log(`📊 Ventas simuladas actuales: ${currentSales.length}`);

    let correctSales = 0;
    let incorrectSales = 0;
    let missingSales = 0;
    let extraSales = 0;
    let fixedSales = 0;

    // Crear mapa de ventas actuales por código de cliente
    const currentSalesMap = new Map();
    currentSales.forEach(sale => {
      if (sale.client?.internalCode) {
        currentSalesMap.set(sale.client.internalCode, sale);
      }
    });

    console.log('\n🔍 Verificando consistencia de ventas...');

    // Verificar cada deuda del SQL original
    for (const debtData of clientDebts) {
      const client = clientMap.get(debtData.cod_cliente.toString());
      
      if (!client) {
        console.log(`   ⚠️  Cliente ${debtData.cod_cliente} no encontrado en BD`);
        continue;
      }

      const currentSale = currentSalesMap.get(debtData.cod_cliente.toString());
      const expectedAmount = debtData.debe;

      if (expectedAmount <= 0) {
        // No debería tener venta
        if (currentSale) {
          console.log(`   🗑️  Eliminando venta innecesaria: ${client.name} (deuda: ${expectedAmount})`);
          await Sale.destroy({ where: { id: currentSale.id } });
          extraSales++;
        }
        continue;
      }

      if (!currentSale) {
        // Falta la venta
        console.log(`   ➕ Creando venta faltante: ${client.name} → €${expectedAmount}`);
        await Sale.create({
          amount: expectedAmount,
          description: `Deuda inicial - ${client.name}`,
          clientId: client.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        missingSales++;
        fixedSales++;
      } else if (Math.abs(parseFloat(currentSale.amount) - expectedAmount) > 0.01) {
        // Venta incorrecta
        console.log(`   🔧 Corrigiendo venta: ${client.name} → €${parseFloat(currentSale.amount)} → €${expectedAmount}`);
        await Sale.update(
          { amount: expectedAmount },
          { where: { id: currentSale.id } }
        );
        incorrectSales++;
        fixedSales++;
      } else {
        // Venta correcta
        correctSales++;
      }
    }

    // Verificar ventas extra (clientes que tienen venta pero no deberían)
    for (const [internalCode, sale] of currentSalesMap) {
      const originalDebt = clientDebts.find(d => d.cod_cliente.toString() === internalCode);
      if (!originalDebt || originalDebt.debe <= 0) {
        console.log(`   🗑️  Eliminando venta extra: ${sale.client?.name} (${internalCode})`);
        await Sale.destroy({ where: { id: sale.id } });
        extraSales++;
      }
    }

    console.log('\n📈 Resumen de correcciones:');
    console.log(`   ✅ Ventas correctas: ${correctSales}`);
    console.log(`   ❌ Ventas incorrectas corregidas: ${incorrectSales}`);
    console.log(`   ➕ Ventas faltantes creadas: ${missingSales}`);
    console.log(`   🗑️  Ventas extra eliminadas: ${extraSales}`);
    console.log(`   🔧 Total correcciones: ${fixedSales}`);

    // Verificar estado final
    console.log('\n🔍 Verificando estado final...');
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

    console.log(`   📊 Ventas simuladas finales: ${finalSalesCount}`);
    console.log(`   💰 Importe total final: €${finalTotalAmount.toFixed(2)}`);

    // Verificar que coincide con el SQL original
    const originalTotalDebt = clientDebts
      .filter(d => d.debe > 0)
      .reduce((sum, d) => sum + d.debe, 0);

    console.log(`   📋 Deuda original del SQL: €${originalTotalDebt.toFixed(2)}`);
    
    if (Math.abs(finalTotalAmount - originalTotalDebt) < 0.01) {
      console.log('   ✅ TOTALES COINCIDEN PERFECTAMENTE');
    } else {
      console.log(`   ⚠️  DIFERENCIA: €${(finalTotalAmount - originalTotalDebt).toFixed(2)}`);
    }

    console.log('\n🎉 ¡Verificación y corrección de ventas completada!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando verificación y corrección de ventas...');
verifyAndFixSales().catch(console.error);

export default verifyAndFixSales;
