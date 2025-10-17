import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';
import { Client, Salesperson } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para parsear el archivo SQL y extraer las asignaciones correctas
function parseClientSalespersonFromSql(filePath) {
  console.log('📖 Leyendo archivo SQL para extraer asignaciones de vendedores...');
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extraer datos de trabajadores
  const trabajadoresRegex = /INSERT INTO `trabajadores`[^;]+;/gs;
  const trabajadoresMatch = content.match(trabajadoresRegex);
  
  const trabajadores = new Map();
  if (trabajadoresMatch) {
    trabajadoresMatch.forEach(match => {
      const valuesRegex = /\([^)]+\)/g;
      const values = match.match(valuesRegex);
      
      if (values) {
        values.forEach(value => {
          const cleanValue = value.replace(/[()]/g, '');
          const parts = cleanValue.split(',').map(p => p.trim());
          
          if (parts.length >= 2) {
            const codUser = parseInt(parts[0]);
            const name = parts[1].replace(/'/g, '');
            trabajadores.set(codUser, name);
          }
        });
      }
    });
  }
  
  console.log('👥 Trabajadores encontrados:', Array.from(trabajadores.entries()));
  
  // Extraer datos de clientes con sus cod_user
  const clientsRegex = /INSERT INTO `clientes`[^;]+;/gs;
  const clientsMatches = content.match(clientsRegex);
  
  if (!clientsMatches) {
    console.log('❌ No se encontraron datos de clientes en el SQL');
    return { trabajadores, clientAssignments: [] };
  }

  const clientAssignments = [];
  
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
          const codCliente = parseInt(cleanParts[0]) || 0;
          const nombreC = cleanParts[1] || '';
          const apellidosC = cleanParts[2] || '';
          const codUser = parseInt(cleanParts[10]) || 0;
          
          const fullName = `${nombreC} ${apellidosC}`.trim();
          
          if (codCliente > 0 && fullName) {
            clientAssignments.push({
              cod_cliente: codCliente,
              nombre_completo: fullName,
              cod_user: codUser,
              trabajador_name: trabajadores.get(codUser) || 'DESCONOCIDO'
            });
          }
        }
      });
    }
  });
  
  return { trabajadores, clientAssignments };
}

async function fixSalespersonAssignments() {
  try {
    console.log('🔧 Iniciando corrección de asignaciones de vendedores...');
    
    // Leer archivo SQL
    const sqlFilePath = path.join(__dirname, '../../tiendaNew(2).sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error('Archivo SQL no encontrado: ' + sqlFilePath);
    }

    const { trabajadores, clientAssignments } = parseClientSalespersonFromSql(sqlFilePath);
    console.log(`📊 Encontradas ${clientAssignments.length} asignaciones en el SQL`);

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener vendedores actuales de la BD
    const salespeople = await Salesperson.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    console.log(`📊 Vendedores en BD: ${salespeople.length}`);
    
    // Crear mapa de nombre -> id de vendedor
    const salespersonMap = new Map();
    salespeople.forEach(sp => {
      salespersonMap.set(sp.name.toUpperCase(), sp.id);
    });

    // Obtener todos los clientes actuales
    const clients = await Client.findAll({
      attributes: ['id', 'internalCode', 'name', 'salespersonId'],
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

    let correctAssignments = 0;
    let incorrectAssignments = 0;
    let fixedAssignments = 0;
    let notFoundClients = 0;
    let unknownSalespeople = 0;

    console.log('\n🔍 Analizando asignaciones...');

    // Analizar cada asignación del SQL
    for (const assignment of clientAssignments) {
      const client = clientMap.get(assignment.cod_cliente.toString());
      
      if (!client) {
        notFoundClients++;
        continue;
      }

      // Determinar el vendedor correcto según el SQL
      let correctSalespersonId = null;
      
      if (assignment.cod_user === 0) {
        // cod_user = 0 no existe, asignar a David (cod_user = 1) por defecto
        correctSalespersonId = salespersonMap.get('DAVID');
        console.log(`   ⚠️  Cliente ${client.name} tenía cod_user=0, asignando a David`);
      } else {
        const trabajadorName = trabajadores.get(assignment.cod_user);
        if (trabajadorName) {
          correctSalespersonId = salespersonMap.get(trabajadorName.toUpperCase());
        }
      }

      if (!correctSalespersonId) {
        unknownSalespeople++;
        console.log(`   ❌ No se encontró vendedor para ${assignment.trabajador_name} (cod_user: ${assignment.cod_user})`);
        continue;
      }

      // Verificar si la asignación actual es correcta
      if (client.salespersonId === correctSalespersonId) {
        correctAssignments++;
      } else {
        incorrectAssignments++;
        
        // Corregir la asignación
        try {
          await Client.update(
            { salespersonId: correctSalespersonId },
            { where: { id: client.id } }
          );
          
          const salespersonName = salespeople.find(sp => sp.id === correctSalespersonId)?.name || 'DESCONOCIDO';
          console.log(`   🔧 Corregido: ${client.name} → ${salespersonName}`);
          fixedAssignments++;
        } catch (error) {
          console.error(`   ❌ Error corrigiendo ${client.name}:`, error.message);
        }
      }
    }

    console.log('\n📈 Resumen de correcciones:');
    console.log(`   ✅ Asignaciones correctas: ${correctAssignments}`);
    console.log(`   ❌ Asignaciones incorrectas encontradas: ${incorrectAssignments}`);
    console.log(`   🔧 Asignaciones corregidas: ${fixedAssignments}`);
    console.log(`   ⚠️  Clientes no encontrados: ${notFoundClients}`);
    console.log(`   ❓ Vendedores desconocidos: ${unknownSalespeople}`);

    // Verificar el estado final
    console.log('\n🔍 Verificando estado final...');
    const clientsWithNullSalesperson = await Client.count({
      where: { salespersonId: null }
    });
    
    console.log(`   📊 Clientes sin vendedor asignado: ${clientsWithNullSalesperson}`);

    // Mostrar distribución por vendedor
    const distribution = await sequelize.query(`
      SELECT s.name, COUNT(c.id) as client_count
      FROM salespeople s
      LEFT JOIN clients c ON s.id = c.salesperson_id
      GROUP BY s.id, s.name
      ORDER BY client_count DESC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log('\n👥 Distribución final por vendedor:');
    distribution.forEach(item => {
      console.log(`   - ${item.name}: ${item.client_count} clientes`);
    });

    console.log('\n🎉 ¡Corrección de asignaciones completada!');

  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
console.log('Iniciando corrección de asignaciones de vendedores...');
fixSalespersonAssignments().catch(console.error);

export default fixSalespersonAssignments;
