# 📊 Configuración de Analytics Históricos

Este documento explica cómo configurar y usar los analytics históricos en el sistema de gestión de clientes.

## 🎯 Objetivo

Los analytics históricos permiten visualizar datos de ventas y pagos anteriores a octubre de 2025, proporcionando una vista completa del rendimiento histórico del negocio.

## 🏗️ Arquitectura

### Tablas Creadas

1. **`historical_sales`** - Contiene datos de ventas históricas
2. **`historical_payments`** - Contiene datos de pagos históricos

### Modelos

- `HistoricalSale.js` - Modelo para ventas históricas
- `HistoricalPayment.js` - Modelo para pagos históricos

### API Endpoints

- `GET /api/dashboard/historical` - Obtiene analytics históricos
  - Parámetros opcionales:
    - `year` - Filtrar por año específico
    - `month` - Filtrar por mes específico (requiere year)

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración de Datos

```bash
# Desde el directorio backend
cd backend
node scripts/migrate_historical_data.js
```

Este script:
- ✅ Crea las tablas `historical_sales` y `historical_payments`
- ✅ Inserta datos de ejemplo de 2021
- ✅ Verifica que los datos se insertaron correctamente

### 2. Verificar en Neon Database

Conecta a tu base de datos Neon y verifica que las tablas se crearon:

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'historical_%';

-- Contar registros
SELECT 'Ventas históricas' as tipo, COUNT(*) as total FROM historical_sales
UNION ALL
SELECT 'Pagos históricos' as tipo, COUNT(*) as total FROM historical_payments;

-- Ver datos de ejemplo
SELECT * FROM historical_sales LIMIT 5;
SELECT * FROM historical_payments LIMIT 5;
```

### 3. Usar en el Frontend

Los analytics históricos están integrados en el Dashboard:

1. Ve al Dashboard principal
2. Haz clic en el botón **"📊 Analytics Históricos"**
3. Usa los filtros para ver datos por año/mes específico

## 📊 Funcionalidades

### Datos Mostrados

1. **Resumen General**
   - Total de ventas históricas
   - Total de pagos históricos
   - Balance neto

2. **Ventas por Período**
   - Transacciones por mes/año
   - Total vendido por período
   - Venta promedio

3. **Pagos por Período**
   - Número de pagos por período
   - Total cobrado
   - Pago promedio

4. **Top 10 Clientes Históricos**
   - Clientes que más han comprado
   - Total gastado por cliente
   - Número de compras

5. **Top 10 Productos Históricos**
   - Productos más vendidos
   - Ingresos por producto
   - Veces vendido

### Filtros Disponibles

- **Por Año**: 2020, 2021, 2022, 2023, 2024
- **Por Mes**: Enero a Diciembre (requiere seleccionar año primero)
- **Todos los datos**: Sin filtros para ver el histórico completo

## 🔧 Personalización

### Agregar Más Datos Históricos

Para agregar más datos históricos, puedes:

1. **Usar el script SQL directamente**:
```sql
INSERT INTO historical_sales (codCom, codArt, codCli, nombreCli, apellidosCli, nombreArt, precio, cantidad, subtotal, total, fechaCom, vista, cod_user) 
VALUES (30, 1, 12345, 'NUEVO CLIENTE', 'APELLIDO', 'PRODUCTO', 100.00, 1, 100.00, 100.00, '2020-01-15', 3, 1);
```

2. **Modificar el script de migración** y ejecutarlo nuevamente

3. **Importar desde CSV** (funcionalidad futura)

### Modificar Períodos

Para cambiar los años disponibles en los filtros, edita el archivo:
`frontend/src/components/HistoricalAnalytics.jsx`

```javascript
const years = ['2019', '2020', '2021', '2022', '2023', '2024']; // Agregar/quitar años
```

## 🐛 Troubleshooting

### Error: "No hay datos históricos disponibles"

1. Verifica que las tablas existen en la base de datos
2. Ejecuta el script de migración
3. Revisa los logs del backend para errores de conexión

### Error: "Cannot read properties of undefined"

1. Verifica que el endpoint `/api/dashboard/historical` responde correctamente
2. Revisa la configuración de la base de datos
3. Asegúrate de que los modelos están correctamente importados

### Datos no se muestran correctamente

1. Verifica el formato de fechas en la base de datos
2. Revisa que los campos numéricos no contengan valores nulos
3. Comprueba los filtros de fecha en las consultas SQL

## 📝 Archivos Modificados/Creados

### Backend
- `models/HistoricalSale.js` ✨ Nuevo
- `models/HistoricalPayment.js` ✨ Nuevo
- `models/index.js` ✏️ Modificado
- `controllers/dashboardController.js` ✏️ Modificado
- `routes/dashboard.js` ✏️ Modificado
- `scripts/create_historical_tables.sql` ✨ Nuevo
- `scripts/migrate_historical_data.js` ✨ Nuevo

### Frontend
- `components/HistoricalAnalytics.jsx` ✨ Nuevo
- `pages/Dashboard.jsx` ✏️ Modificado
- `api/services.js` ✏️ Modificado

## 🎉 Beneficios

1. **Vista Completa**: Análisis histórico completo del negocio
2. **Comparativas**: Comparar rendimiento entre diferentes períodos
3. **Insights**: Identificar tendencias y patrones históricos
4. **Separación**: Los datos históricos no interfieren con las operaciones actuales
5. **Performance**: Consultas optimizadas con índices apropiados

## 🔮 Próximas Mejoras

- [ ] Gráficos interactivos con Chart.js
- [ ] Exportación a Excel/PDF
- [ ] Comparativas entre períodos
- [ ] Alertas basadas en tendencias históricas
- [ ] Importación masiva de datos históricos desde CSV
