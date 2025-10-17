# Guía de Migración - Código Interno de Cliente

## Cambios Realizados

### 1. **Base de Datos**
- ✅ Nuevo campo `internalCode` agregado al modelo `Client`
- ✅ El campo es único (UNIQUE) para evitar códigos duplicados
- ✅ Es opcional (NULLABLE) para compatibilidad con clientes existentes

### 2. **Backend**
- ✅ Controlador de clientes actualizado para manejar `internalCode`
- ✅ Búsqueda mejorada: ahora busca por nombre, `internalCode` o ID
- ✅ Parámetro de búsqueda: `?search=xxx` (búsqueda en nombre, código o ID)

### 3. **Frontend**
- ✅ **Dashboard**: Buscadores agregados en tablas de clientes morosos y oportunidades
  - Búsqueda por nombre/vendedor
  - Filtro por rango de deuda (mínimo y máximo)
  
- ✅ **Pagos y Ventas**: Autocomplete mejorado para selección de cliente
  - Busca por nombre
  - Busca por código interno
  - Muestra formato: `[CÓDIGO] Nombre`

## Pasos de Implementación

### Paso 1: Actualizar la Base de Datos

Si estás usando Sequelize con migraciones:

```bash
npm run migrate
```

O manualmente con una herramienta de BD (pgAdmin, psql, etc.):

```sql
ALTER TABLE clients 
ADD COLUMN "internalCode" VARCHAR(255) UNIQUE;
```

### Paso 2: Migrar Datos del SQL Antiguo

El archivo `tiendaNew(2).sql` está en la raíz del proyecto. Para importar los clientes:

```bash
cd backend
npm run migrate:old-db
```

**¿Qué hace este comando?**
- ✅ Lee el archivo SQL antiguo (`tiendaNew(2).sql`)
- ✅ Extrae los clientes (campo `cod_cliente` → `internalCode`)
- ✅ Limpia la tabla actual de clientes
- ✅ Importa todos los clientes nuevos
- ✅ Los asigna al vendedor por defecto "Importado"

### Paso 3: Verificar la Migración

Después de ejecutar el comando, deberías ver algo como:

```
🚀 Starting migration from old database...
✅ Found 150 clients in SQL file
📝 Created default salesperson for imports
🗑️  Cleared 0 existing clients
✅ Migration completed!
   - Successfully imported: 150 clients
   - Errors: 0
```

### Paso 4: Asignar Clientes a Vendedores (Opcional)

Después de la importación, los clientes estarán asignados al vendedor "Importado". Puedes:
- Reasignarlos manualmente en la interfaz
- O hacer un script personalizado si tienes mapeo de vendedores

## Características de Búsqueda

### En la Dashboard
```
- Tablas de clientes morosos y oportunidades
- Busca por: nombre del cliente, nombre del vendedor
- Filtra por: rango de deuda (mínimo - máximo)
```

### En Pagos/Ventas
```
- Autocomplete del cliente
- Busca por: nombre O código interno
- Muestra: [CÓDIGO] Nombre Cliente
```

### Endpoint de API
```
GET /api/clients?search=valor
- Busca en: nombre, internalCode, ID
- Ejemplo: GET /api/clients?search=1001&salespersonId=uuid
```

## Cambios en el Modelo

### Antes
```javascript
Client {
  id: UUID,
  name: String,
  phone: String,
  email: String,
  address: String,
  salespersonId: UUID,
  timestamps
}
```

### Después
```javascript
Client {
  id: UUID,
  internalCode: String (UNIQUE, NULL),  // ← NUEVO
  name: String,
  phone: String,
  email: String,
  address: String,
  salespersonId: UUID,
  timestamps
}
```

## Rollback (Si es necesario)

Si necesitas deshacer los cambios:

```bash
# Reversión de Sequelize
npm run migrate:undo

# O manualmente:
ALTER TABLE clients 
DROP COLUMN "internalCode";
```

## Resolución de Problemas

### Error: "Archivo SQL no encontrado"
- Asegúrate que `tiendaNew(2).sql` está en la raíz del proyecto
- Ruta esperada: `gestion_clientes/tiendaNew(2).sql`

### Error: "Duplicate entry for internalCode"
- Algunos códigos podrían estar duplicados en el SQL antiguo
- El script mostrará un mensaje de error pero continuará
- Puedes verificar duplicados en el SQL

### Error: "Salesperson not found"
- El vendedor "Importado" no existe
- El script lo crea automáticamente, no debería dar error

### Los clientes no aparecen en el frontend
- Verifica que tengas clientes asignados a tu vendedor
- Recuerda que después de importar, están bajo "Importado"
- Puedes cambiarlos en la página de Clientes

## Testing

Después de la migración, prueba:

1. ✅ Ve a Dashboard → verifica que haya datos
2. ✅ Ve a Pagos → crea un pago, busca cliente por código
3. ✅ Ve a Ventas → crea una venta, busca cliente por nombre
4. ✅ Usa los filtros de deuda en Dashboard
5. ✅ Prueba autocomplete con [código] y nombre

## Soporte

Si tienes problemas:
1. Verifica el archivo `tiendaNew(2).sql`
2. Revisa la consola del servidor (logs)
3. Asegúrate que la BD está corriendo
4. Verifica permisos en la carpeta del proyecto