# 📊 Sistema de Gestión de Clientes y Ventas

Una aplicación Full-Stack profesional para gestionar vendedores, clientes, ventas y pagos con un sistema avanzado de cuenta corriente y cierres de mes personalizados.

## 🚀 Instalación Automática (Equipo Nuevo)

#### 🚀 Instalación Automática (Recomendado)

**Solo necesitas ejecutar un comando:**

```powershell
# Abrir PowerShell como Administrador y ejecutar:
.\instalar_y_ejecutar.ps1
```

#### ✨ Lo que hace automáticamente:

- ✅ **Instala Git** si no está presente (winget/choco)
- ✅ **Clona el repositorio** desde GitHub si no existe localmente
- ✅ **Instala Node.js** si no está presente
- ✅ **Instala todas las dependencias** del backend y frontend
- ✅ **Configura la base de datos** (Neon recomendado)
- ✅ **Inicia el backend** (`npm start`)
- ✅ **Inicia el frontend** (`npm run dev`)
- ✅ **Se auto-actualiza** si hay nuevas versiones
- ✅ **Espera confirmación** de que ambos servicios están listos

#### 🎯 Resultado:
- 🌐 Frontend corriendo en: http://localhost:5173
- 🔧 Backend corriendo en: http://localhost:5000

---

## 📋 Requisitos

- **Windows 10/11**
- **Conexión a internet** (para descargar dependencias y clonar repo)
- **Cuenta en Neon** para la base de datos (se configura automáticamente)

**Nota:** El script instala todo lo necesario automáticamente.

### 🆘 Solución de Problemas:
- **Error de permisos:** Ejecuta PowerShell como Administrador
- **Node.js no instala:** Descárgalo manualmente desde nodejs.org
- **Neon no conecta:** Configura tu DATABASE_URL en `backend/.env`

---

## 🚀 Características Principales

### 💼 **Gestión Completa**
- **CRUD Completo** para Vendedores, Clientes, Ventas y Pagos
- **Sistema de Cuenta Corriente**: Deuda calculada dinámicamente (Ventas - Pagos)
- **Códigos Internos** para clientes migrados del sistema anterior
- **Filtros avanzados** por vendedor, búsqueda de texto y rangos de deuda

### 📈 **Dashboard Analítico Avanzado**
- **KPIs en Tiempo Real**: Deuda total, ventas y pagos por período
- **Rankings de Vendedores** por total vendido
- **Clientes Morosos** (sin pagos en período específico)
- **Oportunidades de Venta** (clientes con deuda baja)
- **Filtros de Fecha Personalizados** con períodos flexibles
- **Bug Fix**: Filtros de fecha incluyen todo el día (23:59:59)

### 🗓️ **Sistema de Cierres de Mes**
- **Cierres Personalizados** con nombres descriptivos
- **Períodos Inteligentes** que se calculan automáticamente
- **Búsqueda de Cierres** por nombre y fechas
- **Métricas Guardadas** de cada cierre (ventas, pagos, deuda, neto)
- **Historial Completo** de todos los cierres realizados

### 📊 **Analytics Históricos**
- **Sistema Híbrido**: Datos actuales + históricos separados
- **9,039 Pagos Históricos** de 2021-2025 importados
- **557 Ventas Históricas** de 2021 migradas automáticamente
- **Filtros por Año/Mes**: Análisis granular de períodos pasados
- **Top Clientes/Productos**: Insights históricos de rendimiento
- **Vista Separada**: No interfiere con operaciones actuales
- **Migración Automática**: Scripts completos para importar datos

### 🔄 **Migración de Datos**
- **Importación desde SQL** del sistema anterior
- **Scripts de Migración** automatizados
- **Preservación de Datos** originales con códigos internos
- **Validación y Limpieza** de datos durante la migración
- **Datos Históricos Completos**: 557 ventas + 9,039 pagos históricos
- **Scripts Automatizados**: Migración completa con un solo comando

### 🎨 **Interfaz Moderna**
- **Material-UI** con diseño responsive
- **Filtros Dinámicos** en tiempo real
- **Modales Interactivos** para crear cierres
- **Autocompletado** para búsqueda de cierres
- **Indicadores Visuales** de estado y métricas

### 📋 Requisitos Mínimos:
- Windows 10/11
- Conexión a internet (para instalar Node.js)
- **Cuenta en Neon** (PostgreSQL en la nube) - https://neon.tech
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Clonar y Estructura Base

```bash
git clone <repo-url>
cd gestion_clientes
```

### 2. Configurar Backend

#### 2.1 Variables de Entorno

Crea una cuenta en [Neon](https://neon.tech) y configura tu base de datos:

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tu configuración de Neon:

```env
DATABASE_URL=postgresql://usuario:password@ep-xxxx.neon.tech/gestion_clientes?sslmode=require
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

#### 2.2 Instalar Dependencias

```bash
npm install
```

#### 2.3 Inicializar Base de Datos

Sequelize sincronizará automáticamente al iniciar. Para limpiar y recrear:

```bash
npm run migrate
```

#### 2.4 Scripts de Migración de Datos

El proyecto incluye scripts para migrar datos existentes:

**Migración desde archivo SQL (tiendaNew.sql):**

```bash
# Migrar todos los datos desde el archivo SQL
node scripts/migrateSqlDataFixed.js
```

**Crear datos de prueba:**

```bash
# Crear datos de prueba para desarrollo
node scripts/seedTestData.js
```

**Migración completa de datos históricos:**

```bash
# Crear tablas históricas
node scripts/create_historical_tables_complete.sql

# Migrar TODOS los datos históricos (557 ventas + 9,039 pagos)
python scripts/extract_all_historical_data.py
node scripts/historical_data_complete.sql
```

**Notas importantes:**
- El script de migración SQL procesará automáticamente clientes, vendedores, ventas y pagos
- Los clientes mantendrán su `internalCode` original para referencia
- Las fechas se preservan del archivo original
- Se crean vendedores automáticamente si no existen
- Los datos históricos incluyen registros de 2021-2025 filtrados

### 3. Configurar Frontend

```bash
cd ../frontend
npm install
```

## 🚀 Ejecutar la Aplicación

### Desarrollo

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Producción

**Backend:**

```bash
cd backend
npm start
```

**Frontend:**

```bash
cd frontend
npm run build
npm run preview
```

## 📊 API Endpoints

### Vendedores

```
GET    /api/salespeople          - Obtener todos
POST   /api/salespeople          - Crear nuevo
GET    /api/salespeople/:id      - Obtener por ID
PUT    /api/salespeople/:id      - Actualizar
DELETE /api/salespeople/:id      - Eliminar
```

### Clientes

```
GET    /api/clients              - Obtener todos (con deuda calculada)
POST   /api/clients              - Crear nuevo
GET    /api/clients/:id          - Obtener por ID (con deuda)
PUT    /api/clients/:id          - Actualizar
DELETE /api/clients/:id          - Eliminar
```

### Ventas

```
GET    /api/sales                - Obtener todas
POST   /api/sales                - Crear nueva
GET    /api/sales/:id            - Obtener por ID
PUT    /api/sales/:id            - Actualizar
DELETE /api/sales/:id            - Eliminar
GET    /api/sales/client/:clientId - Obtener por cliente
```

### Pagos

```
GET    /api/payments             - Obtener todos
POST   /api/payments             - Crear nuevo
GET    /api/payments/:id         - Obtener por ID
PUT    /api/payments/:id         - Actualizar
DELETE /api/payments/:id         - Eliminar
GET    /api/payments/client/:clientId - Obtener por cliente
```

### Dashboard

```
GET    /api/dashboard/kpis       - KPIs generales
GET    /api/dashboard/rankings   - Ranking de vendedores
GET    /api/dashboard/delinquent - Clientes morosos (Top 10)
GET    /api/dashboard/opportunities - Oportunidades de venta (<50€)
GET    /api/dashboard/historical - Analytics históricos (opcional: year, month)
```

### Importación

```
POST   /api/import/clients-from-csv - Importar desde CSV
```

### Cierres de Mes

```
GET    /api/month-closures           - Obtener todos los cierres
POST   /api/month-closures           - Crear nuevo cierre
GET    /api/month-closures/:id       - Obtener cierre específico
PUT    /api/month-closures/:id       - Actualizar cierre
DELETE /api/month-closures/:id       - Eliminar cierre
```

**Parámetros de consulta para GET /api/month-closures:**
- `search`: Buscar por nombre del cierre
- `salespersonId`: Filtrar por vendedor específico
- `dateFrom` y `dateTo`: Filtrar por rango de fechas

## 📝 Formato CSV para Importación

Crea un archivo `clientes.csv` con el siguiente formato:

```csv
nombre_cliente,telefono_cliente,email_cliente,nombre_vendedor,deuda_inicial
Juan Pérez,123456789,juan@example.com,Carlos García,500
María López,987654321,maria@example.com,Carlos García,300
Pedro Martínez,555666777,pedro@example.com,Ana López,750
```

Columnas requeridas:

- **nombre_cliente**: Nombre del cliente (requerido)
- **telefono_cliente**: Teléfono (requerido)
- **email_cliente**: Email (opcional)
- **nombre_vendedor**: Nombre del vendedor (requerido, se crea si no existe)
- **deuda_inicial**: Deuda inicial en €uro (requerido, número decimal)

## 🗓️ Sistema de Cierres de Mes

### Funcionalidad Principal

El sistema de cierres permite crear períodos personalizados con nombres descriptivos para analizar métricas específicas.

### Cómo Funciona

1. **Primer Cierre**: Se calcula desde el primer día del mes actual hasta la fecha de cierre
2. **Cierres Posteriores**: Se calculan desde el día siguiente del último cierre hasta la nueva fecha
3. **Métricas Automáticas**: Cada cierre guarda ventas, pagos, deuda total y neto del período

### Crear un Cierre

```javascript
// Ejemplo de creación de cierre
POST /api/month-closures
{
  "name": "Primer Cierre Octubre",
  "description": "Cierre inicial del mes de octubre",
  "salespersonId": "uuid-vendedor" // null para todos los vendedores
}
```

### Respuesta del Cierre

```javascript
{
  "id": "uuid-cierre",
  "name": "Primer Cierre Octubre",
  "dateFrom": "2025-09-30",
  "dateTo": "2025-10-17",
  "salespersonId": null,
  "totalSales": 88416.64,
  "totalPayments": 0.00,
  "totalDebt": 88416.64,
  "netAmount": 88416.64,
  "description": "Cierre inicial del mes de octubre",
  "closedBy": "Usuario",
  "created_at": "2025-10-17T14:54:35.236Z"
}
```

### Buscar Cierres

```javascript
// Buscar por nombre
GET /api/month-closures?search=octubre

// Filtrar por vendedor
GET /api/month-closures?salespersonId=uuid-vendedor

// Filtrar por fechas
GET /api/month-closures?dateFrom=2025-10-01&dateTo=2025-10-31
```

## 📱 Funcionalidades del Frontend

### Dashboard Avanzado

#### **KPIs Dinámicos**
- **Deuda Total**: Suma de todas las deudas actuales
- **Ventas del Período**: Filtradas por fechas seleccionadas
- **Pagos del Período**: Filtradas por fechas seleccionadas
- **Neto del Período**: Diferencia entre ventas y pagos

#### **Filtros de Período**
- **Selector de Cierres**: Dropdown con autocompletado de cierres guardados
- **Fechas Manuales**: Selección libre de fecha desde/hasta
- **Botón "Cerrar Mes"**: Abre modal para crear nuevo cierre
- **Botón "Últimos 30 días"**: Resetea a vista por defecto

#### **Rankings y Análisis**
- **Ranking de Vendedores** por total vendido
- **Clientes Morosos** (sin pagos en período específico)
- **Oportunidades de Venta** (deuda < 75€, destacadas en verde)
- **Filtros de Búsqueda** en tiempo real para todas las tablas

### Sistema de Cierres Interactivo

#### **Modal de Creación**
- **Nombre Personalizado**: Campo obligatorio para identificar el cierre
- **Descripción Opcional**: Campo libre para notas adicionales
- **Información del Período**: Muestra automáticamente las fechas que abarcará
- **Vendedor Específico**: Si está filtrado, el cierre será solo para ese vendedor

#### **Búsqueda y Selección**
- **Autocompletado**: Busca cierres por nombre mientras escribes
- **Formato Descriptivo**: Muestra "Nombre (fecha-desde - fecha-hasta)"
- **Aplicación Automática**: Al seleccionar un cierre, actualiza el dashboard
- **Historial Completo**: Acceso a todos los cierres creados

### Gestión de Datos Mejorada

#### **Vendedores**
- **CRUD Completo**: Crear, editar, eliminar, listar
- **Filtro de Contexto**: Selección global que afecta todo el sistema
- **Deuda Total**: Calculada dinámicamente por vendedor

#### **Clientes**
- **CRUD Avanzado**: Con códigos internos y asignación a vendedor
- **Búsqueda Inteligente**: Por nombre, código interno o teléfono
- **Filtros de Deuda**: Rangos mínimo y máximo
- **Indicadores Visuales**: Colores según estado de deuda

#### **Ventas y Pagos**
- **CRUD Completo**: Con asociación automática a clientes
- **Filtros por Vendedor**: Herencia del contexto global
- **Fechas Flexibles**: Soporte para períodos personalizados
- **Métodos de Pago**: Configurables (Efectivo, Transferencia, Tarjeta)

### Analytics Históricos

#### **Vista Dedicada**
- **Acceso desde Sidebar**: Opción "Analytics Históricos" en menú lateral
- **Sistema Híbrido**: Datos históricos separados de operaciones actuales
- **Filtros Avanzados**: Por año (2020-2025) y mes específico

#### **Datos Históricos Completos**
- **557 Ventas Históricas**: Desde enero 2021 hasta diciembre 2021
- **9,039 Pagos Históricos**: Cobros registrados desde 2021 hasta 2025
- **Top 10 Clientes**: Ranking de clientes con mayor gasto histórico
- **Top 10 Productos**: Productos más vendidos históricamente

#### **Métricas Históricas**
- **Resumen General**: Total ventas, pagos y balance neto
- **Ventas por Período**: Análisis mensual/anual de transacciones
- **Pagos por Período**: Tendencias de cobros históricos
- **Comparativas**: Insights para análisis de tendencias

### Importación y Migración

#### **Importación CSV**
- **Interfaz Drag-and-Drop** para archivos CSV
- **Validación en Tiempo Real** de datos
- **Reporte Detallado** con éxitos y errores
- **Creación Automática** de vendedores si no existen

#### **Migración SQL**
- **Scripts Automatizados** para migrar desde sistema anterior
- **Preservación de Códigos**: Mantiene referencias del sistema original
- **Limpieza de Datos**: Validación y corrección automática
- **Reporte de Migración**: Estadísticas detalladas del proceso

## 🧮 Lógica de Negocio

### Cálculo de Deuda

```
Deuda Cliente = SUM(Ventas) - SUM(Pagos)
```

Se calcula dinámicamente en cada consulta para garantizar precisión.

### Total por Vendedor

```
Total Vendedor = SUM(Deuda de todos sus clientes)
```

### Clientes Morosos

Criterios:
- Deuda > 0
- Último pago > 60 días atrás (o sin pagos)

### Oportunidades de Venta

Criterios:
- Deuda < 50€
- Cliente activo

## 🔒 Notas de Seguridad

- Variables de entorno nunca en el código
- CORS configurado por ambiente
- Validación de datos en backend
- Prepared statements con Sequelize
- SSL/TLS en producción

## 🚀 Despliegue

### Backend en Render

1. Fork del repositorio
2. Conectar a Render
3. Configurar variables de entorno
4. Desplegar

### Frontend en Vercel

1. Conectar repositorio
2. Variables de entorno: `VITE_API_URL`
3. Desplegar

## 📚 Estructura del Proyecto

```
gestion_clientes/
├── backend/
│   ├── config/
│   │   └── database.js                    # Configuración de Sequelize
│   ├── models/
│   │   ├── Salesperson.js                 # Modelo de vendedores
│   │   ├── Client.js                      # Modelo de clientes
│   │   ├── Sale.js                        # Modelo de ventas
│   │   ├── Payment.js                     # Modelo de pagos
│   │   ├── MonthClosure.js               # Modelo de cierres de mes
│   │   ├── HistoricalSale.js             # Modelo de ventas históricas ✨
│   │   ├── HistoricalPayment.js          # Modelo de pagos históricos ✨
│   │   └── index.js                       # Asociaciones de modelos
│   ├── controllers/
│   │   ├── salespersonController.js       # Lógica de vendedores
│   │   ├── clientController.js            # Lógica de clientes
│   │   ├── saleController.js              # Lógica de ventas
│   │   ├── paymentController.js           # Lógica de pagos
│   │   ├── dashboardController.js         # Lógica del dashboard
│   │   ├── monthClosureController.js      # Lógica de cierres
│   │   └── importController.js            # Lógica de importación
│   ├── routes/
│   │   ├── salespeople.js                 # Rutas de vendedores
│   │   ├── clients.js                     # Rutas de clientes
│   │   ├── sales.js                       # Rutas de ventas
│   │   ├── payments.js                    # Rutas de pagos
│   │   ├── dashboard.js                   # Rutas del dashboard
│   │   ├── monthClosures.js               # Rutas de cierres
│   │   └── import.js                      # Rutas de importación
│   ├── scripts/
│   │   ├── migrateSqlDataFixed.js         # Migración desde SQL
│   │   ├── createDebtSales.js             # Crear ventas por deuda
│   │   ├── seedTestData.js                # Datos de prueba
│   │   ├── create_historical_tables.sql   # Crear tablas históricas ✨
│   │   ├── extract_all_historical_data.py # Extraer datos históricos ✨
│   │   └── historical_data_complete.sql   # Datos históricos completos ✨
│   ├── server.js                          # Servidor principal
│   ├── package.json                       # Dependencias backend
│   └── .env.example                       # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosConfig.js             # Configuración de Axios
│   │   │   └── services.js                # Servicios API (incluye cierres)
│   │   ├── components/
│   │   │   └── Layout.jsx                 # Layout principal
│   │   ├── context/
│   │   │   └── SalespersonContext.jsx     # Context de vendedores
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx              # Dashboard con cierres
│   │   │   ├── Salespeople.jsx            # Gestión de vendedores
│   │   │   ├── Clients.jsx                # Gestión de clientes
│   │   │   ├── Sales.jsx                  # Gestión de ventas
│   │   │   ├── Payments.jsx               # Gestión de pagos
│   │   │   ├── Import.jsx                 # Importación de datos
│   │   │   └── HistoricalAnalytics.jsx    # Analytics históricos ✨
│   │   ├── App.jsx                        # Componente principal
│   │   └── main.jsx                       # Punto de entrada
│   ├── index.html                         # HTML principal
│   ├── vite.config.js                     # Configuración de Vite
│   ├── package.json                       # Dependencias frontend
│   └── .gitignore                         # Archivos ignorados
├── tiendaNew(2).sql                       # Archivo SQL para migración
└── README.md                              # Esta documentación
```

## 🐛 Troubleshooting

### Error de conexión a BD

- Verificar variable `DATABASE_URL`
- Confirmar que PostgreSQL está corriendo
- Probar conexión: `psql -U usuario -d gestion_clientes`

### CORS Error

- Verificar `CORS_ORIGIN` en `.env`
- Asegurar que Frontend y Backend usan URLs correctas

### Puerto en Uso

```bash
# Backend
PORT=5001 npm run dev

# Frontend
npm run dev -- --port 5174
```

## 📞 Soporte

Para preguntas o problemas, revisa los logs:

**Backend:**

```bash
NODE_ENV=development npm run dev
```

**Frontend:**

Abre DevTools (F12) para ver errores de red y consola

## 📄 Licencia

MIT

## 🎯 Roadmap (Fase 2)

- [ ] Endpoint `/api/chatbot-query` para análisis en lenguaje natural
- [ ] Autenticación y roles de usuario
- [ ] Exportación a Excel/PDF de cierres
- [ ] Notificaciones por email de cierres vencidos
- [ ] Gráficos avanzados con Chart.js
- [ ] Comparativas entre cierres
- [ ] App móvil con React Native
- [ ] Backup automático de cierres

## 📊 Métricas del Sistema Actual

### Datos Migrados Exitosamente
- **567 clientes** con códigos internos preservados
- **294 ventas** con deudas exactas del sistema anterior
- **7 vendedores** con sus asignaciones
- **€88,416.64** en deuda total migrada
- **1 cierre creado** como ejemplo funcional

### Datos Históricos Completos
- **557 ventas históricas** de 2021 importadas
- **9,039 pagos históricos** de 2021-2025 importados
- **Sistema híbrido** operativo (actual + histórico)
- **Analytics históricos** completamente funcionales

### Rendimiento
- **API REST** optimizada con Sequelize ORM
- **Consultas dinámicas** para cálculo de deudas
- **Filtros en tiempo real** sin recargas de página
- **Búsqueda inteligente** con autocompletado
- **Responsive design** para móviles y tablets

---

**Versión**: 2.1.0  
**Estado**: Producción con Analytics Históricos  
**Última actualización**: Octubre 2025  
**Desarrollado por**: Sistema de Gestión Avanzada