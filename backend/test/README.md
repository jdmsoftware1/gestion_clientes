# Tests de Endpoints

Esta carpeta contiene tests para verificar que los endpoints del backend funcionan correctamente.

## Requisitos

- El servidor debe estar corriendo en `http://localhost:5000`
- `axios` debe estar instalado (ya está en `package.json`)

## Cómo ejecutar los tests

### Test básico de endpoints principales

```bash
node test/endpoints.test.js
```

Este test verifica:
- ✓ GET /api/salespeople - Obtiene lista de vendedores
- ✓ GET /api/clients - Obtiene todos los clientes
- ✓ GET /api/clients?salespersonId=... - Filtra clientes por vendedor
- ✓ GET /api/dashboard/kpis - Obtiene KPIs del dashboard
- ✓ GET /api/dashboard/delinquent - Obtiene clientes con deuda

### Test completo de todos los endpoints

```bash
node test/complete.test.js
```

Este test verifica:
- Vendedores (crear, obtener, actualizar, eliminar)
- Clientes (crear, obtener, actualizar, eliminar)
- Ventas (crear, obtener, actualizar, eliminar)
- Pagos (crear, obtener, actualizar, eliminar)
- Dashboard (KPIs, oportunidades, clientes morosos)

## Problemas comunes

### "there is no parameter $1"

Este error ocurre cuando se usan parámetros posicionales de PostgreSQL (`$1`) en lugar de placeholders de Sequelize (`?`).

**Solución:** Usar `?` en las queries raw de Sequelize.

```javascript
// ✓ CORRECTO
WHERE c.id = ?

// ✗ INCORRECTO
WHERE c.id = $1
```

### Error de conexión a la BD

Asegúrate que:
1. PostgreSQL está corriendo
2. Las variables de entorno en `.env` son correctas
3. La base de datos existe y está configurada

### Timeout

Si los tests tardan más de 15 segundos, el servidor podría estar lento. Aumenta el `max_wait_time` en la configuración del test.

## Estructura de respuestas esperadas

### Clientes
```json
[
  {
    "id": "uuid",
    "name": "Nombre",
    "phone": "123456789",
    "email": "email@example.com",
    "address": "Dirección",
    "salespersonId": "uuid",
    "debt": 0,
    "lastPaymentMonth": "10/2024",
    "createdAt": "2024-10-16T...",
    "updatedAt": "2024-10-16T..."
  }
]
```

### Dashboard KPIs
```json
{
  "totalDebt": 0,
  "totalSales": 0,
  "averageDebt": 0,
  "clientCount": 0
}
```

## Notas

- Los tests usan `validateStatus: () => true` para capturar errores HTTP sin lanzar excepciones
- Se usa colores en la consola para mejor visualización (verde = éxito, rojo = error)
- Los IDs se obtienen dinámicamente del servidor, no están hardcodeados