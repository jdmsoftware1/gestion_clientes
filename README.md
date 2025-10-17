# 📊 Sistema de Gestión de Clientes y Ventas

Una aplicación Full-Stack profesional para gestionar vendedores, clientes, ventas y pagos con un sistema avanzado de cuenta corriente y cierres de mes personalizados.

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

### 🗓️ **Sistema de Cierres de Mes**
- **Cierres Personalizados** con nombres descriptivos
- **Períodos Inteligentes** que se calculan automáticamente
- **Búsqueda de Cierres** por nombre y fechas
- **Métricas Guardadas** de cada cierre (ventas, pagos, deuda, neto)
- **Historial Completo** de todos los cierres realizados

### 🔄 **Migración de Datos**
- **Importación desde SQL** del sistema anterior
- **Scripts de Migración** automatizados
- **Preservación de Datos** originales con códigos internos
- **Validación y Limpieza** de datos durante la migración

### 🎨 **Interfaz Moderna**
- **Material-UI** con diseño responsive
- **Filtros Dinámicos** en tiempo real
- **Modales Interactivos** para crear cierres
- **Autocompletado** para búsqueda de cierres
- **Indicadores Visuales** de estado y métricas

## 📋 Requisitos Previos

- Node.js (v16+)
- PostgreSQL (v12+) o acceso a Neon
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Clonar y Estructura Base

```bash
git clone <repo-url>
cd gestion_clientes
```

### 2. Configurar Backend

#### 2.1 Variables de Entorno

```bash
cd backend
cp .env.example .env
```

Edita `.env` con tu configuración:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/gestion_clientes
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**Para Neon (Recomendado para Producción):**

```env
DATABASE_URL=postgresql://usuario:contraseña@ep-xxxx.neon.tech/gestion_clientes?sslmode=require
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://tu-dominio.com
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

**Notas importantes:**
- El script de migración SQL procesará automáticamente clientes, vendedores, ventas y pagos
- Los clientes mantendrán su `internalCode` original para referencia
- Las fechas se preservan del archivo original
- Se crean vendedores automáticamente si no existen

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
│   │   └── seedTestData.js                # Datos de prueba
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
│   │   │   └── Import.jsx                 # Importación de datos
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

### Rendimiento
- **API REST** optimizada con Sequelize ORM
- **Consultas dinámicas** para cálculo de deudas
- **Filtros en tiempo real** sin recargas de página
- **Búsqueda inteligente** con autocompletado
- **Responsive design** para móviles y tablets

---

**Versión**: 2.0.0  
**Estado**: Producción con Sistema de Cierres  
**Última actualización**: Octubre 2025  
**Desarrollado por**: Sistema de Gestión Avanzada