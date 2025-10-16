# 🪟 Setup en Windows (PowerShell)

Guía paso a paso para Windows usando PowerShell.

## Requisitos

- Node.js LTS (https://nodejs.org/) - incluye npm
- PostgreSQL (https://www.postgresql.org/download/windows/) o Neon Cloud
- Git (opcional, pero recomendado)

## ✅ Verificar Instalación

```powershell
# Abrir PowerShell como Administrador
node --version    # Debe mostrar v16+
npm --version     # Debe mostrar v7+
psql --version    # Si instalaste PostgreSQL local
```

## 📦 Opción 1: PostgreSQL Local

### 1️⃣ Crear Base de Datos

```powershell
# Conectar a PostgreSQL (te pedirá contraseña de superuser)
psql -U postgres

# En la consola psql, ejecutar:
CREATE DATABASE gestion_clientes;
CREATE USER appuser WITH PASSWORD 'tu_contraseña';
ALTER ROLE appuser SET client_encoding TO 'utf8';
ALTER ROLE appuser SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE gestion_clientes TO appuser;
\q
```

### 2️⃣ Configurar Backend

```powershell
cd backend
copy .env.example .env
```

Editar `.env` con Notepad++/VS Code:

```env
DATABASE_URL=postgresql://appuser:tu_contraseña@localhost:5432/gestion_clientes
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Instalar y Ejecutar

```powershell
npm install
npm run dev
```

✅ Backend listo en `http://localhost:5000`

---

## ☁️ Opción 2: Neon Cloud (Recomendado)

Más fácil, sin instalar PostgreSQL.

### 1️⃣ Crear Proyecto en Neon

1. Ir a https://console.neon.tech/
2. Sign up (usa GitHub)
3. Crear nuevo proyecto
4. Copiar connection string

### 2️⃣ Configurar Backend

```powershell
cd backend
copy .env.example .env
```

Editar `.env`:

```env
DATABASE_URL=postgresql://usuario:password@ep-xxxx.neon.tech/gestion_clientes?sslmode=require
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Instalar y Ejecutar

```powershell
npm install
npm run dev
```

---

## 🎨 Frontend Setup

```powershell
# En otra ventana PowerShell
cd frontend
copy .env.example .env
npm install
npm run dev
```

✅ Frontend en `http://localhost:5173`

---

## 🖱️ Primera Vez: Pasos Rápidos

1. **Abre 2 ventanas PowerShell**

```powershell
# Ventana 1: Backend
cd backend
npm run dev

# Ventana 2: Frontend
cd frontend
npm run dev
```

2. **Abre navegador**: http://localhost:5173

3. **Crea un Vendedor**:
   - Menú ≡ > Vendedores > "Nuevo Vendedor"
   - Nombre: "Carlos García"
   - Email: carlos@example.com

4. **Crea un Cliente**:
   - Menú > Clientes > "Nuevo Cliente"
   - Nombre: "Juan Pérez"
   - Teléfono: 123456789
   - Vendedor: "Carlos García"

5. **Crea una Venta**:
   - Menú > Ventas > "Nueva Venta"
   - Cliente: "Juan Pérez"
   - Monto: 500
   - Descripción: "Venta de productos"

6. **Ver Dashboard**: Menú > Dashboard
   - Verás la deuda de 500€

7. **Crea un Pago**:
   - Menú > Pagos > "Nuevo Pago"
   - Cliente: "Juan Pérez"
   - Monto: 200
   - Método: "Efectivo"

8. **Revisar Dashboard**: Deuda ahora será 300€

---

## 📊 Importar Datos de Prueba

### Opción A: Archivo CSV

```powershell
# Desde raíz del proyecto
cat sample-data.csv   # Ver contenido
```

1. Abre: http://localhost:5173/import
2. Selecciona: `sample-data.csv`
3. Click: "Importar"
4. ✅ Verás 5 clientes importados

### Opción B: Manual (sin CSV)

Ya lo hiciste arriba en "Primera Vez".

---

## 🐛 Troubleshooting en Windows

### ❌ "Cannot find module"

```powershell
# En backend o frontend
rm -r node_modules
npm install
npm run dev
```

### ❌ "Port 5000 already in use"

```powershell
# Ver qué proceso usa puerto 5000
netstat -ano | findstr :5000

# Matar proceso (si PID es 1234)
Stop-Process -Id 1234 -Force

# O cambiar puerto en backend
$env:PORT=5001; npm run dev
```

### ❌ "PostgreSQL connection refused"

```powershell
# Verificar que PostgreSQL está corriendo
Get-Service postgresql-x64-*

# Si no, iniciarlo:
Start-Service postgresql-x64-15  # (o tu versión)

# O conectar a Neon en lugar de local
```

### ❌ "EACCES permission denied"

Ejecutar PowerShell como **Administrador**.

### ❌ "Cannot find npm"

Reiniciar PowerShell después de instalar Node.js.

---

## 🎯 Comandos Útiles en Windows

```powershell
# Backend
cd backend
npm run dev        # Desarrollo
npm start          # Producción
npm run migrate    # Sincronizar BD

# Frontend
cd frontend
npm run dev        # Desarrollo
npm run build      # Compilar
npm run preview    # Ver build

# General
Get-ChildItem              # Ver archivos (ls)
Remove-Item -Recurse node_modules  # Borrar carpeta
Copy-Item file.txt file2.txt       # Copiar
```

---

## 📁 Estructura de Carpetas (Windows)

```
C:\Users\TuUsuario\...
└── gestion_clientes
    ├── backend
    ├── frontend
    ├── README.md
    ├── QUICK_START.md
    └── DEPLOYMENT.md
```

---

## 🔑 Archivos Importantes

```
backend/.env           ← Editar con tus credenciales DB
frontend/.env          ← URL del backend
sample-data.csv        ← Datos de prueba para importar
```

---

## 🚀 Producción en Windows (Advanced)

### Compilar Frontend

```powershell
cd frontend
npm run build
# Genera carpeta 'dist' lista para servidor
```

### Usar PM2 para Backend (Production)

```powershell
# Instalar PM2 globalmente
npm install -g pm2

# En carpeta backend
pm2 start server.js --name "gestion-backend"

# Autostart en reboots
pm2 startup
pm2 save

# Ver logs
pm2 logs gestion-backend
```

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| No carga dashboard | Verifica backend está corriendo |
| CORS error | Verifica `CORS_ORIGIN` en .env |
| No importa CSV | Formato debe ser: nombre,teléfono,email,vendedor,deuda |
| Puerto ocupado | Cambia puerto en .env o mata proceso |
| BD no conecta | Verifica `DATABASE_URL` y que PostgreSQL está corriendo |

---

**Versión**: 1.0.0
**Sistema Operativo**: Windows 10+
**Shell**: PowerShell 5.0+