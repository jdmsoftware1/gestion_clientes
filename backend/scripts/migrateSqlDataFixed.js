import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Salesperson, Client, Sale, Payment } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función mejorada para parsear el archivo SQL
function parseSqlFile(filePath) {
  console.log('📖 Leyendo archivo SQL...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Función helper para extraer datos de INSERT statements
  function extractInsertData(tableName) {
    const regex = new RegExp(`INSERT INTO \`${tableName}\`[^;]+;`, 'gs');
    const matches = content.match(regex);
    if (!matches) return [];
    
    const allData = [];
    matches.forEach(match => {
      // Extraer los valores entre paréntesis
      const valuesRegex = /\([^)]+\)/g;
      const values = match.match(valuesRegex);
      
      if (values) {
        values.forEach(value => {
          const cleanValue = value.replace(/[()]/g, '');
          // Split más inteligente que maneja comillas
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
              // Check if it's escaped
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
          parts.push(current.trim()); // Add the last part
          
          // Clean up the parts
          const cleanParts = parts.map(part => {
            const trimmed = part.trim();
            if (trimmed === 'NULL' || trimmed === '') return null;
            if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || 
                (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
              return trimmed.slice(1, -1);
            }
            return trimmed;
          });
          
          allData.push(cleanParts);
        });
      }
    });
    
    return allData;
  }

  // Extraer datos de cada tabla
  const clientsRaw = extractInsertData('clientes');
  const salesRaw = extractInsertData('comprasb');
  const paymentsRaw = extractInsertData('pagos');
  const workersRaw = extractInsertData('trabajadores');

  // Procesar datos de clientes
  const clientsData = clientsRaw.map(parts => ({
    cod_cliente: parseInt(parts[0]) || 0,
    nombre_c: parts[1] || '',
    apellidos_c: parts[2] || '',
    direccion_c: parts[3] || '',
    telefono_c: parts[4] && parts[4] !== '0' ? parts[4] : null,
    email_c: parts[5] || null,
    debe: parseFloat(parts[6]) || 0,
    fecha_creacion: parts[7] || null,
    ult_fecha_pago: parts[8] || null,
    DNI_NIF: parts[9] || null,
    cod_user: parseInt(parts[10]) || 1
  })).filter(item => item.cod_cliente > 0);

  // Procesar datos de ventas
  const salesData = salesRaw.map(parts => ({
    codCom: parseInt(parts[0]) || 0,
    codArt: parts[1] ? parseInt(parts[1]) : null,
    codCli: parseInt(parts[2]) || 0,
    nombreCli: parts[3] || '',
    apellidosCli: parts[4] || '',
    nombreArt: parts[5] || 'Producto',
    precio: parseFloat(parts[6]) || 0,
    cantidad: parseInt(parts[7]) || 1,
    subtotal: parseFloat(parts[8]) || 0,
    total: parseFloat(parts[9]) || 0,
    fechaCom: parts[10] || new Date().toISOString().split('T')[0],
    vista: parseInt(parts[11]) || 1,
    cod_user: parseInt(parts[12]) || 1
  })).filter(item => item.codCom > 0 && item.codCli > 0);

  // Procesar datos de pagos
  const paymentsData = paymentsRaw.map(parts => ({
    cod_cliente_p: parseInt(parts[0]) || 0,
    nombre_c_p: parts[1] || '',
    apellidos_c_p: parts[2] || '',
    fecha_pago: parts[3] || new Date().toISOString().split('T')[0],
    tipo_de_pago: parts[4] || 'EFECTIVO',
    cantidad_pago: parseFloat(parts[5]) || 0,
    cod_pago: parseInt(parts[6]) || 0,
    vista: parseInt(parts[7]) || 1,
    cod_user: parseInt(parts[8]) || 1
  })).filter(item => item.cod_pago > 0 && item.cod_cliente_p > 0);

  // Procesar datos de trabajadores
  const workersData = workersRaw.map(parts => ({
    cod_user: parseInt(parts[0]) || 0,
    name: parts[1] || 'Usuario',
    pass: parts[2] || ''
  })).filter(item => item.cod_user > 0);

  return { clientsData, salesData, paymentsData, workersData };
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos desde SQL...');
    
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
            email: `${worker.name.toLowerCase().replace(/\s+/g, '')}@empresa.com`
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

    // Asegurar que hay al menos un vendedor por defecto
    if (salespersonMap.size === 0) {
      const defaultSalesperson = await Salesperson.findOrCreate({
        where: { name: 'Vendedor Principal' },
        defaults: {
          name: 'Vendedor Principal',
          email: 'vendedor@empresa.com'
        }
      });
      salespersonMap.set(1, defaultSalesperson[0].id);
      console.log('   ✅ Creado vendedor por defecto');
    }

    // 2. Migrar clientes
    console.log('\n👤 Migrando clientes...');
    const clientMap = new Map();
    let clientsCreated = 0;
    let clientsSkipped = 0;
    
    for (const clientData of clientsData) {
      try {
        let salespersonId = salespersonMap.get(clientData.cod_user);
        if (!salespersonId) {
          // Usar el primer vendedor disponible
          salespersonId = Array.from(salespersonMap.values())[0];
        }

        const fullName = `${clientData.nombre_c || ''} ${clientData.apellidos_c || ''}`.trim();
        if (!fullName) {
          console.log(`   ⚠️  Cliente sin nombre, saltando...`);
          clientsSkipped++;
          continue;
        }
        
        const [client, created] = await Client.findOrCreate({
          where: { 
            internalCode: clientData.cod_cliente.toString()
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
          clientsCreated++;
          if (clientsCreated % 50 === 0) {
            console.log(`   📊 Procesados ${clientsCreated} clientes...`);
          }
        } else {
          clientsSkipped++;
        }
      } catch (error) {
        console.error(`   ❌ Error creando cliente ${clientData.nombre_c}:`, error.message);
        clientsSkipped++;
      }
    }
    
    console.log(`   ✅ Clientes creados: ${clientsCreated}`);
    console.log(`   ⚠️  Clientes saltados: ${clientsSkipped}`);

    // 3. Migrar ventas
    console.log('\n💰 Migrando ventas...');
    let salesCreated = 0;
    let salesSkipped = 0;
    
    for (const saleData of salesData) {
      try {
        const clientId = clientMap.get(saleData.codCli);
        if (!clientId) {
          salesSkipped++;
          continue;
        }

        // Validar fecha
        let saleDate;
        try {
          saleDate = new Date(saleData.fechaCom + 'T00:00:00.000Z');
          if (isNaN(saleDate.getTime())) {
            saleDate = new Date();
          }
        } catch {
          saleDate = new Date();
        }

        await Sale.create({
          amount: Math.abs(saleData.total),
          description: `${saleData.nombreArt} (Migrado desde SQL - ID: ${saleData.codCom})`,
          clientId: clientId,
          createdAt: saleDate,
          updatedAt: saleDate
        });
        
        salesCreated++;
        if (salesCreated % 50 === 0) {
          console.log(`   📊 Procesadas ${salesCreated} ventas...`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando venta ${saleData.codCom}:`, error.message);
        salesSkipped++;
      }
    }
    
    console.log(`   ✅ Ventas creadas: ${salesCreated}`);
    console.log(`   ⚠️  Ventas saltadas: ${salesSkipped}`);

    // 4. Migrar pagos
    console.log('\n💳 Migrando pagos...');
    let paymentsCreated = 0;
    let paymentsSkipped = 0;
    
    for (const paymentData of paymentsData) {
      try {
        const clientId = clientMap.get(paymentData.cod_cliente_p);
        if (!clientId) {
          paymentsSkipped++;
          continue;
        }

        // Validar fecha
        let paymentDate;
        try {
          paymentDate = new Date(paymentData.fecha_pago + 'T00:00:00.000Z');
          if (isNaN(paymentDate.getTime())) {
            paymentDate = new Date();
          }
        } catch {
          paymentDate = new Date();
        }

        await Payment.create({
          amount: Math.abs(paymentData.cantidad_pago),
          paymentMethod: paymentData.tipo_de_pago || 'EFECTIVO',
          clientId: clientId,
          createdAt: paymentDate,
          updatedAt: paymentDate
        });
        
        paymentsCreated++;
        if (paymentsCreated % 50 === 0) {
          console.log(`   📊 Procesados ${paymentsCreated} pagos...`);
        }
      } catch (error) {
        console.error(`   ❌ Error creando pago ${paymentData.cod_pago}:`, error.message);
        paymentsSkipped++;
      }
    }
    
    console.log(`   ✅ Pagos creados: ${paymentsCreated}`);
    console.log(`   ⚠️  Pagos saltados: ${paymentsSkipped}`);

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

    // Calcular métricas financieras
    const totalSalesAmount = await Sale.sum('amount') || 0;
    const totalPaymentsAmount = await Payment.sum('amount') || 0;
    const totalDebt = totalSalesAmount - totalPaymentsAmount;
    
    console.log('\n💰 Métricas financieras:');
    console.log(`   - Total vendido: €${totalSalesAmount.toFixed(2)}`);
    console.log(`   - Total pagado: €${totalPaymentsAmount.toFixed(2)}`);
    console.log(`   - Deuda total: €${totalDebt.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar migración
console.log('Iniciando migración de datos SQL...');
migrateData().catch(console.error);

export default migrateData;
