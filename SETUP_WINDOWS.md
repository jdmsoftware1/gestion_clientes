# 🪟 Setup Automático en Windows

## 🚀 Instalación en 1 Solo Paso

Ya no necesitas seguir guías complejas. Solo ejecuta este comando:

```powershell
# Abrir PowerShell como Administrador y ejecutar:
.\instalar_y_ejecutar.ps1
```

### ✨ Lo que hace automáticamente:

- ✅ **Instala Node.js** si no está presente
- ✅ **Instala todas las dependencias** del backend y frontend
- ✅ **Configura la base de datos** (Neon recomendado)
- ✅ **Inicia el backend** (`npm start`)
- ✅ **Inicia el frontend** (`npm run dev`)
- ✅ **Se auto-actualiza** si hay nuevas versiones
- ✅ **Espera confirmación** de que ambos servicios están listos

---

## 📋 Requisitos Mínimos

- Windows 10/11
- Conexión a internet
- **Cuenta en Neon** (PostgreSQL en la nube) - https://neon.tech

### 🔧 Requisitos Automáticos

- Node.js se instala automáticamente si no existe
- npm se instala con Node.js
- Base de datos en Neon (configurar manualmente)

---

## ☁️ Configuración de Base de Datos

### 1. Crear cuenta en Neon

1. Ve a: https://console.neon.tech/
2. Regístrate (usa GitHub para hacerlo rápido)
3. Crea un nuevo proyecto
4. Copia el connection string

### 2. Configurar credenciales

Edita `backend/.env` con tus credenciales de Neon:

```env
DATABASE_URL=postgresql://usuario:password@ep-xxxx.neon.tech/gestion_clientes?sslmode=require
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

---

## 🎯 Primer Uso - Pasos Rápidos

1. **Ejecutar instalación automática:**
   ```powershell
   .\instalar_y_ejecutar.ps1
   ```

2. **Configurar Neon** (primera vez):
   - Crear cuenta en https://neon.tech
   - Copiar DATABASE_URL a `backend/.env`

3. **¡Listo!** Aplicación corriendo en:
   - 🌐 Frontend: http://localhost:5173
   - 🔧 Backend: http://localhost:5000

---

## 📊 Funcionalidades Disponibles

### Dashboard Principal
- 📈 **KPIs en tiempo real**: Deuda total, ventas y pagos por período
- 👥 **Ranking de vendedores** por total vendido
- 👤 **Clientes morosos** (sin pagos >60 días)
- 🎯 **Oportunidades de venta** (deuda <50€)

### Gestión Completa
- 🏪 **CRUD completo** para Vendedores, Clientes, Ventas y Pagos
- 💰 **Sistema de cuenta corriente** (deuda calculada automáticamente)
- 📅 **Cierres de mes personalizados** con nombres descriptivos
- 📊 **Analytics históricos** (datos desde 2021 hasta 2024)

### Analytics Históricos
- 📅 **Filtros por año** (2021-2024)
- 📊 **Ventas y pagos por período**
- 🏆 **Top clientes y productos**
- 📈 **Tendencias históricas**

---

## 🆘 Solución de Problemas

### ❌ "Node.js no se instala"
```powershell
# Instalar manualmente desde:
# https://nodejs.org/
# Luego reiniciar PowerShell y ejecutar el script nuevamente
```

### ❌ "Neon no conecta"
```powershell
# Verificar backend/.env
# DATABASE_URL debe tener el formato correcto
# Ejemplo: postgresql://user:pass@ep-xxxx.neon.tech/dbname?sslmode=require
```

### ❌ "Puertos ocupados"
```powershell
# Ver qué usa los puertos
netstat -ano | findstr :5000
netstat -ano | findstr :5173

# Matar proceso si es necesario
Stop-Process -Id <PID> -Force
```

### ❌ "Error de permisos"
```powershell
# Ejecutar PowerShell como Administrador
# O cambiar política de ejecución:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 🔄 Auto-Actualización

El script se **actualiza automáticamente** cuando hay nuevas versiones:

- 📦 **Detecta cambios** en el repositorio
- 💾 **Hace backup** de cambios locales
- 🔄 **Actualiza código** a última versión
- 🔁 **Se reinicia** automáticamente

### Recuperar cambios locales:
```powershell
git stash pop  # Si el script hizo backup de tus cambios
```

---

## 🎨 Desarrollo Avanzado

### Ejecutar individualmente:

```powershell
# Solo backend
cd backend
npm start

# Solo frontend (en otra terminal)
cd frontend
npm run dev
```

### Comandos útiles:

```powershell
# Backend
npm run dev     # Desarrollo con auto-reload
npm start       # Producción
npm run migrate # Sincronizar base de datos

# Frontend
npm run dev     # Desarrollo con Vite
npm run build   # Compilar para producción
npm run preview # Ver build localmente
```

---

## 📁 Estructura del Proyecto

```
gestion_clientes/
├── backend/                    # API Node.js + Express
│   ├── controllers/           # Lógica de negocio
│   ├── models/               # Modelos Sequelize
│   ├── routes/               # Endpoints API
│   ├── scripts/              # Scripts de migración
│   ├── .env                  # ⚠️ Configurar con tus credenciales
│   └── server.js             # Servidor principal
├── frontend/                  # React + Vite + Material-UI
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── pages/           # Páginas principales
│   │   ├── api/             # Servicios API
│   │   └── context/         # Context providers
│   └── package.json
├── instalar_y_ejecutar.ps1   # 🚀 Script de instalación automática
└── README.md                 # Documentación principal
```

---

## 🚀 Producción (Opcional)

### Backend con PM2:
```powershell
npm install -g pm2
cd backend
pm2 start server.js --name "gestion-backend"
pm2 startup
pm2 save
```

### Frontend:
```powershell
cd frontend
npm run build
# Subir carpeta 'dist' a tu servidor web
```

---

## 📞 Contacto y Soporte

| Problema | Solución |
|----------|----------|
| No carga dashboard | Verificar que backend está corriendo en puerto 5000 |
| CORS error | Verificar `CORS_ORIGIN=http://localhost:5173` en .env |
| BD no conecta | Verificar DATABASE_URL en Neon console |
| Puerto ocupado | Cambiar PORT en .env o liberar puerto |
| Analytics no muestra datos 2024 | Los datos se agregan automáticamente en la instalación |

---

**Versión**: 2.1.0
**Sistema**: Windows 10/11 con PowerShell
**Instalación**: 100% Automática
**Base de datos**: Neon Cloud (PostgreSQL)
**Última actualización**: Octubre 2025