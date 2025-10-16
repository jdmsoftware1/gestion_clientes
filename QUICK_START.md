# ⚡ Inicio Rápido

Guía de 5 minutos para tener la aplicación corriendo localmente.

## Requisitos Mínimos

- Node.js v16+
- PostgreSQL corriendo
- Git

## Pasos

### 1️⃣ Clonar y Preparar

```bash
cd gestion_clientes
```

### 2️⃣ Backend

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env (cambiar DATABASE_URL si es necesario)
# DATABASE_URL=postgresql://usuario:password@localhost:5432/gestion_clientes

# Instalar
npm install

# Ejecutar
npm run dev
```

**Resultado**: Backend corriendo en `http://localhost:5000`

### 3️⃣ Frontend (Nueva Terminal)

```bash
cd frontend

# Copiar variables de entorno
cp .env.example .env

# Instalar
npm install

# Ejecutar
npm run dev
```

**Resultado**: Frontend en `http://localhost:5173`

### 4️⃣ ¡Listo!

Abre en navegador: **http://localhost:5173**

---

## Próximos Pasos

1. **Crear Vendedor**: Menú > Vendedores > "Nuevo Vendedor"
2. **Crear Cliente**: Menú > Clientes > "Nuevo Cliente" (selecciona vendedor)
3. **Crear Venta**: Menú > Ventas > "Nueva Venta" (automáticamente sube la deuda)
4. **Crear Pago**: Menú > Pagos > "Nuevo Pago" (reduce la deuda)
5. **Ver Dashboard**: Inicio > verás deuda total y analíticas
6. **Importar CSV**: Usa el archivo `sample-data.csv` en raíz

---

## Troubleshooting Rápido

### ❌ "Can't connect to DB"

```bash
# Verifica que PostgreSQL está corriendo
psql -U postgres

# O crea la BD manualmente
createdb gestion_clientes
```

### ❌ "Port 5000 already in use"

```bash
# Backend en puerto diferente
PORT=5001 npm run dev
```

### ❌ "API not found"

- Espera a que backend arrange (2-3 segundos)
- Verifica que terminal backend dice "Server running on port 5000"
- Recarga el navegador

### ❌ "CSV import fails"

- Asegúrate columnas: `nombre_cliente,telefono_cliente,email_cliente,nombre_vendedor,deuda_inicial`
- Sin espacios extras
- Números decimales con punto (.)

---

## Atajo: Pre-llenar Datos de Prueba

```bash
# En el navegador, ve a:
# http://localhost:5173/import

# Sube el archivo: sample-data.csv
# Espera confirmación ✓
```

---

## Resumen de Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard con analíticas |
| `/salespeople` | Gestión de vendedores |
| `/clients` | Gestión de clientes |
| `/sales` | Gestión de ventas |
| `/payments` | Gestión de pagos |
| `/import` | Importar desde CSV |

---

## Comandos Útiles

```bash
# Backend
npm run dev        # Desarrollo (hot reload)
npm start          # Producción
npm run migrate    # Sincronizar BD

# Frontend
npm run dev        # Desarrollo
npm run build      # Compilar para producción
npm run preview    # Ver build localmente
```

---

## Tips 💡

- La deuda se calcula automáticamente en tiempo real
- Los clientes con deuda < 50€ aparecen en verde
- Los clientes morosos (sin pagar 60+ días) aparecen en rojo
- Los vendedores se crean automáticamente al importar CSV
- Todos los datos se sincronizan entre frontend y backend

---

**¿Necesitas ayuda?** Ver `README.md` para documentación completa.