# 📊 Configuración de Analytics Históricos

Este documento explica cómo configurar y usar los analytics históricos en el sistema de gestión de clientes.

## 🎯 Objetivo

Los analytics históricos permiten visualizar datos de ventas y pagos anteriores a octubre de 2025, proporcionando una vista completa del rendimiento histórico del negocio.

## 🏗️ Arquitectura

### Tablas Creadas

1. **`historical_sales`** - Contiene datos de ventas históricas (557 registros)
2. **`historical_payments`** - Contiene datos de pagos históricos (9,039 registros)

### Modelos

- `HistoricalSale.js` - Modelo para ventas históricas
- `HistoricalPayment.js` - Modelo para pagos históricos

### API Endpoints

- `GET /api/dashboard/historical` - Obtiene analytics históricos
  - Parámetros opcionales:
    - `year` - Filtrar por año específico (2020-2025)
    - `month` - Filtrar por mes específico (requiere year)

## 🚀 Instalación y Configuración

### 1. Ejecutar Migración Completa de Datos

```bash
# Desde el directorio backend/scripts
cd backend/scripts

# 1. Crear tablas históricas
node ../node_modules/.bin/sequelize-cli db:migrate --name create_historical_tables.js

# 2. Extraer TODOS los datos históricos del archivo SQL
python extract_all_historical_data.py

# 3. Importar datos en la base de datos
psql -h tu-host -U tu-usuario -d gestion_clientes -f historical_data_complete.sql
```

Este proceso:
- ✅ Crea las tablas `historical_sales` y `historical_payments`
- ✅ Extrae 557 registros de ventas históricas de 2021
- ✅ Extrae 9,039 registros de pagos históricos de 2021-2025
- ✅ Convierte formato MySQL a PostgreSQL automáticamente
- ✅ Filtra datos anteriores a octubre 2025
- ✅ Importa datos directamente en la base de datos

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

-- Resultado esperado:
-- Ventas históricas | 557
-- Pagos históricos  | 9039

-- Ver datos de ejemplo
SELECT * FROM historical_sales LIMIT 3;
SELECT * FROM historical_payments LIMIT 3;
```

### 3. Usar en el Frontend

Los analytics históricos están disponibles desde el menú lateral:

1. En el sidebar izquierdo, haz clic en **"📊 Analytics Históricos"**
2. Accede a la página dedicada de analytics históricos
3. Usa los filtros para ver datos por año/mes específico
4. Explora las diferentes métricas históricas disponibles

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

- **Por Año**: 2020, 2021, 2022, 2023, 2024, 2025 (datos filtrados antes de octubre)
- **Por Mes**: Enero a Diciembre (requiere seleccionar año primero)
- **Todos los datos**: Sin filtros para ver el histórico completo (557 ventas + 9,039 pagos)

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
- `models/index.js` ✏️ Modificado (asociaciones)
- `controllers/dashboardController.js` ✏️ Modificado (endpoint historical)
- `routes/dashboard.js` ✏️ Modificado (ruta historical)
- `scripts/create_historical_tables_complete.sql` ✨ Nuevo
- `scripts/extract_all_historical_data.py` ✨ Nuevo
- `scripts/historical_data_complete.sql` ✨ Nuevo (557 ventas + 9,039 pagos)

### Frontend
- `components/HistoricalAnalytics.jsx` ✨ Nuevo
- `pages/HistoricalAnalytics.jsx` ✨ Nuevo (página dedicada)
- `components/Layout.jsx` ✏️ Modificado (sidebar con analytics históricos)
- `App.jsx` ✏️ Modificado (ruta /historical-analytics)
- `api/services.js` ✏️ Modificado (servicio dashboardAPI.getHistorical)

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
