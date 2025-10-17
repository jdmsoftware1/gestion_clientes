# Gestión de Clientes y Ventas

Una aplicación Full-Stack completa para gestionar vendedores, clientes, ventas y pagos con un sistema dinámico de cuenta corriente.

## 🚀 Características

- **CRUD Completo** para Vendedores, Clientes, Ventas y Pagos
- **Sistema de Cuenta Corriente**: Deuda calculada dinámicamente (Ventas - Pagos)
- **Dashboard Analítico** con KPIs, rankings y alertas de clientes morosos
- **Importación CSV** para migración inicial de datos
- **Interfaz Responsive** con Material-UI
- **API RESTful** optimizada con Sequelize ORM

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

## 📱 Funcionalidades del Frontend

### Dashboard

- KPIs: Deuda total, ventas y pagos últimos 30 días
- Ranking de vendedores por total vendido
- Clientes morosos (sin pagos en 60 días)
- Oportunidades de venta (deuda < 50€, destacadas en verde)

### Gestión de Datos

- **Vendedores**: Crear, editar, eliminar, ver deuda total
- **Clientes**: CRUD, asignación a vendedor, deuda visual
- **Ventas**: CRUD, asociación a cliente
- **Pagos**: CRUD, métodos de pago configurables

### Importación

- Interfaz drag-and-drop para CSV
- Validación de datos
- Reporte de importación con éxitos y errores

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
│   │   └── database.js
│   ├── models/
│   │   ├── Salesperson.js
│   │   ├── Client.js
│   │   ├── Sale.js
│   │   ├── Payment.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── salespersonController.js
│   │   ├── clientController.js
│   │   ├── saleController.js
│   │   ├── paymentController.js
│   │   ├── dashboardController.js
│   │   └── importController.js
│   ├── routes/
│   │   ├── salespeople.js
│   │   ├── clients.js
│   │   ├── sales.js
│   │   ├── payments.js
│   │   ├── dashboard.js
│   │   └── import.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axiosConfig.js
│   │   │   └── services.js
│   │   ├── components/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Salespeople.jsx
│   │   │   ├── Clients.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Import.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
└── README.md
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
- [ ] Exportación a Excel/PDF
- [ ] Notificaciones por email
- [ ] Gráficos avanzados
- [ ] App móvil

---

**Versión**: 1.0.0  
**Estado**: Producción  
**Última actualización**: Octubre 2024