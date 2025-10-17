import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer los datos
function parseSqlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extraer datos de clientes
  const clientsMatch = content.match(/INSERT INTO `clientes`[^;]+;/s);
  const clientsData = [];
  if (clientsMatch) {
    const values = clientsMatch[0].match(/\([^)]+\)/g);
    values?.forEach(value => {
      const cleanValue = value.replace(/[()]/g, '');
      const parts = cleanValue.split(',').map(part => {
        const trimmed = part.trim();
        if (trimmed === 'NULL' || trimmed === '') return null;
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      
      if (parts.length >= 11) {
        clientsData.push({
          cod_cliente: parseInt(parts[0]),
          nombre_c: parts[1],
          apellidos_c: parts[2],
          direccion_c: parts[3],
          telefono_c: parts[4] && parts[4] !== '0' ? parts[4] : null,
          email_c: parts[5],
          debe: parseFloat(parts[6]) || 0,
          fecha_creacion: parts[7],
          ult_fecha_pago: parts[8],
          DNI_NIF: parts[9],
          cod_user: parseInt(parts[10])
        });
      }
    });
  }

  // Extraer datos de compras (ventas)
  const salesMatch = content.match(/INSERT INTO `comprasb`[^;]+;/s);
  const salesData = [];
  if (salesMatch) {
    const values = salesMatch[0].match(/\([^)]+\)/g);
    values?.forEach(value => {
      const cleanValue = value.replace(/[()]/g, '');
      const parts = cleanValue.split(',').map(part => {
        const trimmed = part.trim();
        if (trimmed === 'NULL' || trimmed === '') return null;
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      
      if (parts.length >= 12) {
        salesData.push({
          codCom: parseInt(parts[0]),
          codArt: parts[1] ? parseInt(parts[1]) : null,
          codCli: parseInt(parts[2]),
          nombreCli: parts[3],
          apellidosCli: parts[4],
          nombreArt: parts[5],
          precio: parseFloat(parts[6]),
          cantidad: parseInt(parts[7]),
          subtotal: parseFloat(parts[8]),
          total: parseFloat(parts[9]),
          fechaCom: parts[10],
          vista: parseInt(parts[11]),
          cod_user: parts[12] ? parseInt(parts[12]) : null
        });
      }
    });
  }

  // Extraer datos de pagos
  const paymentsMatch = content.match(/INSERT INTO `pagos`[^;]+;/s);
  const paymentsData = [];
  if (paymentsMatch) {
    const values = paymentsMatch[0].match(/\([^)]+\)/g);
    values?.forEach(value => {
      const cleanValue = value.replace(/[()]/g, '');
      const parts = cleanValue.split(',').map(part => {
        const trimmed = part.trim();
        if (trimmed === 'NULL' || trimmed === '') return null;
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      
      if (parts.length >= 9) {
        paymentsData.push({
          cod_cliente_p: parts[0] ? parseInt(parts[0]) : null,
          nombre_c_p: parts[1],
          apellidos_c_p: parts[2],
          fecha_pago: parts[3],
          tipo_de_pago: parts[4],
          cantidad_pago: parseFloat(parts[5]) || 0,
          cod_pago: parseInt(parts[6]),
          vista: parseInt(parts[7]),
          cod_user: parts[8] ? parseInt(parts[8]) : null
        });
      }
    });
  }

  // Extraer datos de trabajadores
  const workersMatch = content.match(/INSERT INTO `trabajadores`[^;]+;/s);
  const workersData = [];
  if (workersMatch) {
    const values = workersMatch[0].match(/\([^)]+\)/g);
    values?.forEach(value => {
      const cleanValue = value.replace(/[()]/g, '');
      const parts = cleanValue.split(',').map(part => {
        const trimmed = part.trim();
        if (trimmed === 'NULL' || trimmed === '') return null;
        if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      
      if (parts.length >= 3) {
        workersData.push({
          cod_user: parseInt(parts[0]),
          name: parts[1],
          pass: parts[2]
        });
      }
    });
  }

  return { clientsData, salesData, paymentsData, workersData };
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const { clientsData, salesData, paymentsData, workersData } = parseSqlFile(sqlFilePath);
    
    console.log(`📊 Datos encontrados:`);
    console.log(`   - Clientes: ${clientsData.length}`);
    console.log(`   - Ventas: ${salesData.length}`);
    console.log(`   - Pagos: ${paymentsData.length}`);
    console.log(`   - Trabajadores: ${workersData.length}`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // 1. Migrar trabajadores (vendedores)
    console.log('\n👥 Migrando vendedores...');
    const salespersonMap = new Map();
    
    for (const worker of workersData) {
      try {
        const [salesperson, created] = await Salesperson.findOrCreate({
          where: { name: worker.name },
          defaults: {
            name: worker.name,
            email: `${worker.name.toLowerCase()}@empresa.com`
          }
        });
        salespersonMap.set(worker.cod_user, salesperson.id);
        if (created) {
          console.log(`   ✅ Creado vendedor: ${worker.name}`);
        } else {
          console.log(`   ⚠️  Vendedor ya existe: ${worker.name}`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando vendedor ${worker.name}:`, error.message);
      }
    }

    // 2. Migrar clientes
    console.log('\n👤 Migrando clientes...');
    const clientMap = new Map();
    
    for (const clientData of clientsData) {
      try {
        const salespersonId = salespersonMap.get(clientData.cod_user);
        if (!salespersonId) {
          console.log(`   ⚠️  Vendedor no encontrado para cliente ${clientData.nombre_c}, saltando...`);
          continue;
        }

        const fullName = `${clientData.nombre_c || ''} ${clientData.apellidos_c || ''}`.trim();
        
        const [client, created] = await Client.findOrCreate({
          where: { 
            name: fullName,
            salespersonId: salespersonId
          },
          defaults: {
            internalCode: clientData.cod_cliente.toString(),
            name: fullName,
            phone: clientData.telefono_c?.toString() || null,
            email: clientData.email_c || null,
            address: clientData.direccion_c || null,
            salespersonId: salespersonId
          }
        });
        
        clientMap.set(clientData.cod_cliente, client.id);
        
        if (created) {
          console.log(`   ✅ Creado cliente: ${fullName}`);
        } else {
          console.log(`   ⚠️  Cliente ya existe: ${fullName}`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando cliente ${clientData.nombre_c}:`, error.message);
      }
    }

    // 3. Migrar ventas
    console.log('\n💰 Migrando ventas...');
    for (const saleData of salesData) {
      try {
        const clientId = clientMap.get(saleData.codCli);
        if (!clientId) {
          console.log(`   ⚠️  Cliente no encontrado para venta ${saleData.codCom}`);
          continue;
        }

        await Sale.create({
          amount: Math.abs(saleData.total),
          description: `${saleData.nombreArt} (Migrado desde SQL)`,
          clientId: clientId,
          createdAt: new Date(saleData.fechaCom + 'T00:00:00.000Z'),
          updatedAt: new Date(saleData.fechaCom + 'T00:00:00.000Z')
        });
        
        console.log(`   ✅ Creada venta: €${saleData.total} para ${saleData.nombreCli}`);
      } catch (error) {
        console.error(`   ❌ Error creando venta ${saleData.codCom}:`, error.message);
      }
    }

    // 4. Migrar pagos
    console.log('\n💳 Migrando pagos...');
    for (const paymentData of paymentsData) {
      try {
        const clientId = clientMap.get(paymentData.cod_cliente_p);
        if (!clientId) {
          console.log(`   ⚠️  Cliente no encontrado para pago ${paymentData.cod_pago}`);
          continue;
        }

        await Payment.create({
          amount: Math.abs(paymentData.cantidad_pago),
          paymentMethod: paymentData.tipo_de_pago || 'EFECTIVO',
          clientId: clientId,
          createdAt: new Date(paymentData.fecha_pago + 'T00:00:00.000Z'),
          updatedAt: new Date(paymentData.fecha_pago + 'T00:00:00.000Z')
        });
        
        console.log(`   ✅ Creado pago: €${paymentData.cantidad_pago} de ${paymentData.nombre_c_p}`);
      } catch (error) {
        console.error(`   ❌ Error creando pago ${paymentData.cod_pago}:`, error.message);
      }
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    
    // Mostrar estadísticas finales
    const totalSalespeople = await Salesperson.count();
    const totalClients = await Client.count();
    const totalSales = await Sale.count();
    const totalPayments = await Payment.count();
    
    console.log('\n📈 Estadísticas finales:');
    console.log(`   - Vendedores: ${totalSalespeople}`);
    console.log(`   - Clientes: ${totalClients}`);
    console.log(`   - Ventas: ${totalSales}`);
    console.log(`   - Pagos: ${totalPayments}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar migración
console.log('Iniciando script de migración...');
migrateData().catch(console.error);

export default migrateData;
