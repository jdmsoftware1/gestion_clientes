# ⚡ Comandos Útiles - Sistema de Gestión de Clientes

## 🚀 Comandos de Inicio Rápido

### Iniciar el Sistema Completo

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Verificar Estado del Sistema

```bash
# Verificar backend
curl http://localhost:5000/health

# Verificar endpoints principales
curl http://localhost:5000/api/salespeople
curl http://localhost:5000/api/clients?salespersonId=TODOS
curl http://localhost:5000/api/dashboard/kpis
curl http://localhost:5000/api/month-closures
```

## 🗄️ Comandos de Base de Datos

### Reiniciar Base de Datos

```bash
cd backend
# El servidor reiniciará automáticamente las tablas
npm start
```

### Migrar Datos desde SQL

```bash
cd backend
node scripts/migrateSqlDataFixed.js
```

### Crear Datos de Prueba

```bash
cd backend
node scripts/seedTestData.js
```

### Limpiar y Recrear Deudas

```bash
cd backend
node scripts/createDebtSales.js
```

## 📊 Comandos de API Testing

### Crear un Cierre de Prueba

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/month-closures" -Method POST -ContentType "application/json" -Body '{"name":"Cierre de Prueba","description":"Cierre para testing"}'
```

### Obtener Todos los Cierres

```bash
curl "http://localhost:5000/api/month-closures"
```

### Buscar Cierres por Nombre

```bash
curl "http://localhost:5000/api/month-closures?search=octubre"
```

### Obtener KPIs con Filtro de Fecha

```bash
curl "http://localhost:5000/api/dashboard/kpis?dateFrom=2025-10-01&dateTo=2025-10-17"
```

### Obtener Clientes Morosos

```bash
curl "http://localhost:5000/api/dashboard/delinquent"
```

## 🔧 Comandos de Desarrollo

### Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Modo Desarrollo con Hot Reload

```bash
# Backend (nodemon)
cd backend
npm run dev

# Frontend (Vite)
cd frontend
npm run dev
```

### Build para Producción

```bash
# Frontend
cd frontend
npm run build
npm run preview
```

## 🐛 Comandos de Debugging

### Ver Logs del Backend

```bash
cd backend
NODE_ENV=development npm start
```

### Verificar Conexión a Base de Datos

```bash
# Si usas PostgreSQL local
psql -U usuario -d gestion_clientes -c "SELECT COUNT(*) FROM clients;"
```

### Limpiar Caché del Frontend

```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Reiniciar Completamente

```bash
# Matar todos los procesos Node
taskkill /F /IM node.exe

# Reiniciar backend
cd backend
npm start

# Reiniciar frontend
cd frontend
npm run dev
```

## 📈 Comandos de Análisis

### Contar Registros en Base de Datos

```bash
# Via API
curl "http://localhost:5000/api/clients?salespersonId=TODOS" | jq length
curl "http://localhost:5000/api/sales?salespersonId=TODOS" | jq length
curl "http://localhost:5000/api/payments?salespersonId=TODOS" | jq length
curl "http://localhost:5000/api/month-closures" | jq length
```

### Obtener Estadísticas Rápidas

```bash
# KPIs generales
curl "http://localhost:5000/api/dashboard/kpis" | jq

# Rankings de vendedores
curl "http://localhost:5000/api/dashboard/rankings" | jq

# Top 10 clientes morosos
curl "http://localhost:5000/api/dashboard/delinquent" | jq
```

## 🔄 Comandos de Migración

### Backup de Datos Actuales

```bash
# Exportar cierres
curl "http://localhost:5000/api/month-closures" > backup_cierres.json

# Exportar clientes
curl "http://localhost:5000/api/clients?salespersonId=TODOS" > backup_clientes.json
```

### Verificar Integridad de Datos

```bash
cd backend
node -e "
const { Client, Sale, Payment } = require('./models/index.js');
async function check() {
  const clients = await Client.count();
  const sales = await Sale.count();  
  const payments = await Payment.count();
  console.log(\`Clientes: \${clients}, Ventas: \${sales}, Pagos: \${payments}\`);
}
check();
"
```

## 🛠️ Comandos de Mantenimiento

### Limpiar Logs

```bash
# Limpiar logs del sistema (Windows)
del /q logs\*.log

# Limpiar caché npm
npm cache clean --force
```

### Actualizar Dependencias

```bash
# Backend
cd backend
npm update

# Frontend  
cd frontend
npm update
```

### Verificar Vulnerabilidades

```bash
# Backend
cd backend
npm audit
npm audit fix

# Frontend
cd frontend
npm audit
npm audit fix
```

## 🚦 Comandos de Testing

### Test de Endpoints Principales

```bash
# Script de test rápido
echo "Testing endpoints..."
curl -s http://localhost:5000/health && echo "✅ Health OK"
curl -s http://localhost:5000/api/salespeople > /dev/null && echo "✅ Salespeople OK"
curl -s "http://localhost:5000/api/clients?salespersonId=TODOS" > /dev/null && echo "✅ Clients OK"
curl -s http://localhost:5000/api/dashboard/kpis > /dev/null && echo "✅ Dashboard OK"
curl -s http://localhost:5000/api/month-closures > /dev/null && echo "✅ Closures OK"
```

### Test de Creación de Cierre

```bash
# Crear cierre de test
curl -X POST "http://localhost:5000/api/month-closures" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Cierre","description":"Cierre de prueba automática"}'

# Verificar que se creó
curl "http://localhost:5000/api/month-closures?search=Test"
```

## 📱 Comandos de Acceso Rápido

### URLs Importantes

```bash
# Frontend
start http://localhost:5173

# Backend API
start http://localhost:5000/health

# Documentación API (si implementas Swagger)
start http://localhost:5000/api-docs
```

### Abrir en Navegador (Windows)

```bash
# Dashboard
start http://localhost:5173

# Clientes
start http://localhost:5173/clients

# Ventas  
start http://localhost:5173/sales

# Pagos
start http://localhost:5173/payments
```

## 🎯 Comandos de Producción

### Build y Deploy

```bash
# Build frontend
cd frontend
npm run build

# Test build local
npm run preview

# Deploy a Vercel (si está configurado)
vercel --prod

# Deploy backend a Render (via git push)
git add .
git commit -m "Deploy to production"
git push origin main
```

### Verificar Producción

```bash
# Test endpoints de producción
curl https://tu-backend.render.com/health
curl https://tu-backend.render.com/api/dashboard/kpis
```

## 📋 Checklist de Comandos Diarios

```bash
# 1. Iniciar sistema
cd backend && npm start &
cd frontend && npm run dev &

# 2. Verificar estado
curl http://localhost:5000/health

# 3. Ver métricas del día
curl http://localhost:5000/api/dashboard/kpis

# 4. Backup de cierres (opcional)
curl http://localhost:5000/api/month-closures > daily_backup.json
```

---

**💡 Tip**: Guarda estos comandos en un archivo `.bat` o `.sh` para ejecutarlos rápidamente.
