# 📋 Ejemplos de Uso - Sistema de Gestión de Clientes

## 🗓️ Ejemplos del Sistema de Cierres de Mes

### Escenario 1: Primer Cierre del Mes

**Situación**: Es 17 de octubre y quieres cerrar el mes desde el 1 de octubre.

**Pasos**:
1. Ve al Dashboard
2. Presiona **"Cerrar Mes"**
3. Introduce nombre: `"Primer Cierre Octubre"`
4. Descripción: `"Cierre inicial del mes de octubre"`
5. Presiona **"Crear Cierre"**

**Resultado**:
```json
{
  "name": "Primer Cierre Octubre",
  "dateFrom": "2025-10-01",
  "dateTo": "2025-10-17",
  "totalSales": 88416.64,
  "totalPayments": 0.00,
  "netAmount": 88416.64
}
```

### Escenario 2: Segundo Cierre (Continuación)

**Situación**: Es 31 de octubre y quieres cerrar desde donde terminó el anterior.

**Pasos**:
1. Presiona **"Cerrar Mes"**
2. Introduce nombre: `"Cierre Final Octubre"`
3. El sistema automáticamente calculará desde el 18 de octubre al 31 de octubre

**Resultado**:
```json
{
  "name": "Cierre Final Octubre",
  "dateFrom": "2025-10-18",
  "dateTo": "2025-10-31",
  "totalSales": 15000.00,
  "totalPayments": 8000.00,
  "netAmount": 7000.00
}
```

### Escenario 3: Buscar y Aplicar Cierre Anterior

**Situación**: Quieres revisar los datos del "Primer Cierre Octubre".

**Pasos**:
1. En el dropdown **"Cierres Guardados"**
2. Escribe `"octubre"`
3. Selecciona `"Primer Cierre Octubre (2025-10-01 - 2025-10-17)"`
4. El dashboard se actualiza automáticamente con esos datos

## 📊 Ejemplos de Consultas API

### Crear un Cierre via API

```bash
curl -X POST "http://localhost:5000/api/month-closures" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cierre Navidad",
    "description": "Cierre especial para temporada navideña",
    "salespersonId": null
  }'
```

### Buscar Cierres por Nombre

```bash
curl "http://localhost:5000/api/month-closures?search=navidad"
```

### Filtrar Cierres por Vendedor

```bash
curl "http://localhost:5000/api/month-closures?salespersonId=uuid-del-vendedor"
```

### Obtener KPIs de un Período Específico

```bash
curl "http://localhost:5000/api/dashboard/kpis?dateFrom=2025-10-01&dateTo=2025-10-17"
```

## 🔍 Ejemplos de Filtros en el Dashboard

### Filtrar por Vendedor Específico

1. Selecciona un vendedor en el dropdown superior
2. Todos los datos (KPIs, clientes morosos, etc.) se filtran automáticamente
3. Los cierres también se filtran por ese vendedor

### Filtrar por Período Personalizado

1. Introduce fecha desde: `2025-10-01`
2. Introduce fecha hasta: `2025-10-15`
3. Presiona **"Aplicar Filtro"**
4. Los KPIs muestran datos solo de ese período

### Buscar Clientes Morosos

1. En la tabla de "Clientes Morosos"
2. Usa el campo de búsqueda para filtrar por nombre
3. Usa los campos de deuda mínima/máxima para filtrar por rango

## 📈 Casos de Uso Reales

### Caso 1: Análisis Mensual de Vendedor

**Objetivo**: Ver el rendimiento de "Bego" en octubre.

**Pasos**:
1. Selecciona "Bego" en el dropdown de vendedores
2. Busca el cierre "Primer Cierre Octubre"
3. Revisa los KPIs filtrados
4. Analiza clientes morosos específicos de Bego

### Caso 2: Comparar Períodos

**Objetivo**: Comparar ventas de octubre vs septiembre.

**Pasos**:
1. Aplica cierre de octubre y anota métricas
2. Crea un filtro manual para septiembre (2025-09-01 a 2025-09-30)
3. Compara los resultados

### Caso 3: Seguimiento de Deudas

**Objetivo**: Ver qué clientes no han pagado en el último mes.

**Pasos**:
1. Usa el filtro de período del último mes
2. Revisa la tabla "Clientes Morosos"
3. Los clientes mostrados no han pagado en ese período específico

## 🛠️ Scripts de Migración

### Migrar Datos desde SQL

```bash
cd backend
node scripts/migrateSqlDataFixed.js
```

**Resultado esperado**:
- Migra vendedores, clientes, ventas y pagos
- Preserva códigos internos
- Calcula deudas correctas

### Crear Datos de Prueba

```bash
cd backend
node scripts/seedTestData.js
```

**Resultado esperado**:
- Crea vendedores de prueba
- Genera clientes con deudas variadas
- Simula ventas y pagos recientes

### Limpiar y Recrear Deudas

```bash
cd backend
node scripts/createDebtSales.js
```

**Resultado esperado**:
- Crea una venta por cliente con su deuda exacta
- Elimina inconsistencias de datos
- Garantiza precisión en cálculos

## 🎯 Mejores Prácticas

### Nomenclatura de Cierres

- **Buenos nombres**: "Primer Cierre Octubre", "Cierre Navidad", "Fin de Trimestre Q1"
- **Malos nombres**: "Cierre1", "Test", "aaa"

### Frecuencia de Cierres

- **Mensual**: Para análisis regulares
- **Semanal**: Para seguimiento detallado
- **Especial**: Para eventos (Navidad, rebajas, etc.)

### Análisis de Datos

1. **Siempre revisar** clientes morosos después de cada cierre
2. **Comparar períodos** para identificar tendencias
3. **Filtrar por vendedor** para análisis individual
4. **Usar descripciones** detalladas en los cierres

## 🚨 Solución de Problemas Comunes

### Error: "No se puede crear el cierre"

**Causa**: Falta el nombre del cierre
**Solución**: Asegúrate de introducir un nombre descriptivo

### Error: "No se encuentran datos"

**Causa**: Filtros demasiado restrictivos
**Solución**: Usa "Últimos 30 días" para resetear filtros

### Dashboard no actualiza

**Causa**: Caché del navegador
**Solución**: Refresca la página (F5) o limpia caché

### Datos inconsistentes

**Causa**: Migración incompleta
**Solución**: Ejecuta `createDebtSales.js` para corregir datos
