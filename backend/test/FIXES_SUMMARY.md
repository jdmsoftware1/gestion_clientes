# Resumen de Errores 500 Corregidos

## 🔴 Problemas Identificados

### Problema 1: Error en `calculateClientDebt()` - "there is no parameter $1"

**Síntomas:**
- GET `/api/clients` retornaba 500
- GET `/api/clients?salespersonId=...` retornaba 500
- Error: `"there is no parameter $1"`

**Root Cause:**
Las queries raw de Sequelize estaban usando sintaxis PostgreSQL (`$1`, `$2`) pero Sequelize espera placeholders (`?`).

**Archivo:** `backend/controllers/clientController.js`

**Líneas problemáticas:**
```javascript
// ✗ INCORRECTO
WHERE c.id = $1
WHERE "clientId" = $1

// ✓ CORRECTO
WHERE c.id = ?
WHERE "clientId" = ?
```

**Solución:**
Cambiar todos los parámetros posicionales `$1`, `$2`, etc. a `?`:

```javascript
export async function calculateClientDebt(clientId) {
  const result = await sequelize.query(
    `
    SELECT COALESCE(SUM(s.amount), 0) - COALESCE(SUM(p.amount), 0) as debt
    FROM clients c
    LEFT JOIN sales s ON c.id = s."clientId"
    LEFT JOIN payments p ON c.id = p."clientId"
    WHERE c.id = ?  // ← Cambiar de $1 a ?
    `,
    { replacements: [clientId], type: sequelize.QueryTypes.SELECT }
  );
  return parseFloat(result[0]?.debt) || 0;
}

export async function getLastPaymentMonth(clientId) {
  const result = await sequelize.query(
    `
    SELECT TO_CHAR(MAX("createdAt"), 'MM/YYYY') as last_month
    FROM payments
    WHERE "clientId" = ?  // ← Cambiar de $1 a ?
    `,
    { replacements: [clientId], type: sequelize.QueryTypes.SELECT }
  );
  return result[0]?.last_month || '-';
}
```

---

### Problema 2: Incluir relacionadas causaba errores en `getAllClients()`

**Síntomas:**
- Mismo error 500 al obtener clientes

**Root Cause:**
El `include` de Salesperson con Promise.all() causaba problemas con Sequelize

**Solución:**
Simplificar el query:
- Remover el `include` de Salesperson
- Usar `raw: true` para obtener datos simples
- Usar `attributes` para especificar solo los campos necesarios
- Usar `order` para ordenar los resultados

```javascript
// ✗ ANTES
const clients = await Client.findAll({
  where,
  include: [{ model: Salesperson, as: 'salesperson' }],
});

// ✓ DESPUÉS
const clients = await Client.findAll({
  where,
  attributes: ['id', 'name', 'phone', 'email', 'address', 'salespersonId', 'createdAt', 'updatedAt'],
  order: [['name', 'ASC']],
  raw: true,
});
```

---

## ✅ Archivos Modificados

### 1. `backend/controllers/clientController.js`
- Líneas 11-28: Simplificar `getAllClients()` 
- Líneas 141-168: Cambiar `$1` a `?` en helpers

### 2. `backend/package.json`
- Agregar scripts de test:
  - `npm test` - Test rápido de endpoints principales
  - `npm test:complete` - Test completo de todos los endpoints

---

## 🧪 Tests Creados

Se creó carpeta `backend/test/` con dos archivos de test:

### `endpoints.test.js`
Test rápido que verifica los endpoints principales. Usa el vendedor ya existente en la BD.

```bash
npm test
```

**Endpoints probados:**
- ✓ GET /api/salespeople
- ✓ GET /api/clients (sin filtro)
- ✓ GET /api/clients?salespersonId=...
- ✓ GET /api/dashboard/kpis
- ✓ GET /api/dashboard/delinquent

### `complete.test.js`
Test exhaustivo de todos los endpoints del sistema.

```bash
npm test:complete
```

**Endpoints probados:**
- ✓ Vendedores (GET)
- ✓ Clientes (GET, GET con filtro, GET por ID)
- ✓ Ventas (GET, GET con filtro, GET por ID)
- ✓ Pagos (GET, GET por ID)
- ✓ Dashboard (KPIs, delinquent, opportunities)

---

## 🔧 Sintaxis Correcta de Sequelize

### Raw Queries

```javascript
// ✓ CORRECTO - Usar ? como placeholder
await sequelize.query('SELECT * FROM clients WHERE id = ?', {
  replacements: [clientId],
  type: QueryTypes.SELECT
});

// ✓ TAMBIÉN CORRECTO - Usar named parameters
await sequelize.query('SELECT * FROM clients WHERE id = :clientId', {
  replacements: { clientId: clientId },
  type: QueryTypes.SELECT
});

// ✗ INCORRECTO - PostgreSQL $1 no funciona con Sequelize
await sequelize.query('SELECT * FROM clients WHERE id = $1', {
  replacements: [clientId],
  type: QueryTypes.SELECT
});
```

### Model.findAll()

```javascript
// ✓ CORRECTO - Especificar attributes y usar raw
const data = await Client.findAll({
  where: { active: true },
  attributes: ['id', 'name', 'email'],
  order: [['name', 'ASC']],
  raw: true,  // Retorna objetos planos, no instancias Sequelize
});

// ✓ TAMBIÉN CORRECTO - Con includes bien configurados
const data = await Client.findAll({
  where: { active: true },
  include: [{
    model: Salesperson,
    as: 'salesperson',
    attributes: ['id', 'name']
  }],
  order: [['name', 'ASC']],
  subQuery: false,  // Importante cuando hay includes
});
```

---

## 📋 Checklist de Validación

- ✅ GET /api/clients sin filtro retorna 200
- ✅ GET /api/clients?salespersonId=... retorna 200
- ✅ GET /api/clients/:id retorna 200
- ✅ Cálculo de debt funciona correctamente
- ✅ Dashboard KPIs funciona con filtro de vendedor
- ✅ Dashboard delinquent funciona
- ✅ Dashboard opportunities funciona
- ✅ Todos los tests pasan

---

## 🚀 Cómo Ejecutar en Producción

1. **Iniciar servidor:**
   ```bash
   npm start
   ```

2. **Ejecutar tests (en otra terminal):**
   ```bash
   npm test          # Test rápido
   npm test:complete # Test exhaustivo
   ```

3. **Si todo pasa:** La aplicación está lista para usar

---

## 📝 Notas Importantes

1. **No cambies `$1` por `?` en PostgreSQL directo** - Ese cambio es SOLO para Sequelize
2. **Siempre especifica `attributes`** cuando uses `raw: true` para evitar overhead
3. **Usa `raw: true`** para queries simples sin relaciones para mejor performance
4. **Usa `include` solo cuando realmente necesites datos relacionados**
5. **Siempre prueba con el vendedor real** al cambiar lógica de filtros