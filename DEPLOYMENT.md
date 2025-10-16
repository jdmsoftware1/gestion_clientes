# 🚀 Guía de Despliegue

## Opción 1: Render.com (Backend) + Vercel (Frontend)

Esta es la configuración recomendada para una aplicación Full-Stack gratuita.

### Backend en Render.com

#### Preparación

1. **Crear cuenta en Render.com**: https://render.com/

2. **Push del código a GitHub**:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/gestion-clientes.git
git push -u origin main
```

#### Despliegue

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Click en "New +" > "Web Service"
3. Conectar tu repositorio GitHub
4. Configurar:
   - **Name**: `gestion-clientes-backend`
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Configurar variables de entorno:

```env
DATABASE_URL=postgresql://usuario:contraseña@neon.tech/gestion_clientes
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://tu-frontend.vercel.app
```

#### Obtener DATABASE_URL de Neon

1. Ir a [Neon Console](https://console.neon.tech/)
2. Crear un nuevo proyecto PostgreSQL
3. Copiar la connection string como `DATABASE_URL`

### Frontend en Vercel

#### Despliegue

1. Ir a [Vercel](https://vercel.com/)
2. Click en "Import Project"
3. Seleccionar tu repositorio GitHub
4. Configurar:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Configurar variables de entorno:

```env
VITE_API_URL=https://tu-backend.onrender.com/api
```

### URLs Finales

- **Backend**: `https://gestion-clientes-backend.onrender.com`
- **Frontend**: `https://gestion-clientes.vercel.app`

---

## Opción 2: Heroku (Deprecated - Migrar a Render)

Heroku retiró su plan gratuito. Usar la Opción 1.

---

## Opción 3: Railway.app

Alternativa a Render con planes generosos.

### Backend en Railway

1. Conectar GitHub: https://railway.app/
2. Crear nuevo proyecto desde repositorio
3. Agregar servicio PostgreSQL
4. Variables de entorno automáticas
5. Deploy automático

### Frontend en Vercel

(Igual que en Opción 1)

---

## Opción 4: Despliegue Local/VPS

Para ambiente de desarrollo o servidor privado.

### Requisitos

- Ubuntu 20.04 LTS (o similar)
- Node.js v16+
- PostgreSQL v12+
- Nginx (reverse proxy)
- SSL (Let's Encrypt)

### Instalación Paso a Paso

```bash
# 1. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 4. Crear usuario y BD
sudo -u postgres createuser appuser
sudo -u postgres createdb -O appuser gestion_clientes

# 5. Clonar código
git clone https://github.com/tu-usuario/gestion-clientes.git
cd gestion-clientes

# 6. Configurar Backend
cd backend
cp .env.example .env
# Editar .env con DATABASE_URL local
npm install
npm start &

# 7. Configurar Frontend
cd ../frontend
npm install
npm run build

# 8. Servir Frontend con Nginx
sudo cp -r dist /var/www/gestion-clientes
```

### Configuración Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        root /var/www/gestion-clientes;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## Monitoreo y Mantenimiento

### Logs en Render

```bash
# Ver logs en tiempo real
render logs --tail 100
```

### Backups de BD

```bash
# En local
pg_dump gestion_clientes > backup.sql

# Restaurar
psql gestion_clientes < backup.sql
```

### Actualizar aplicación

1. Push cambios a GitHub
2. Render/Vercel actualizan automáticamente

---

## Troubleshooting

### Error: "CORS blocked"

Verificar `CORS_ORIGIN` en backend .env

### Error: "Cannot find module"

```bash
cd backend
npm install --production
```

### Error: "Connection refused"

1. Verificar que PostgreSQL está corriendo
2. Verificar DATABASE_URL
3. Verificar puertos (5000 para backend)

### Error: "Out of memory"

En Render/Railway, aumentar plan. En VPS:

```bash
# Aumentar swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Checklist de Despliegue

- [ ] Código en GitHub
- [ ] DATABASE_URL configurado
- [ ] CORS_ORIGIN correcto
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada
- [ ] Prueba de importación CSV
- [ ] Dashboard carga correctamente
- [ ] CRUD completo funcional
- [ ] SSL/HTTPS habilitado
- [ ] Logs monitoreados

---

## Rollback en Caso de Error

### Render

1. Dashboard > Deployment
2. Seleccionar despliegue anterior
3. Click "Redeploy"

### Vercel

1. Deployments > Seleccionar anterior
2. Click "Promote to Production"

---

## Performance Tips

1. **Compresión**: Nginx comprime automáticamente
2. **Caché**: Configurar en Vercel settings
3. **BD**: Usar índices en columnas frecuentes
4. **CDN**: Cloudflare CDN (gratuito)

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2024