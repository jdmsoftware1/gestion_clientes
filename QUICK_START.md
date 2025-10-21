# ⚡ Inicio Rápido - Instalación Automática

## 🚀 1 Minuto para tener todo corriendo

### Paso Único:
```powershell
# Abrir PowerShell como Administrador y ejecutar:
.\instalar_y_ejecutar.ps1
```

**¡Eso es todo!** La aplicación estará corriendo automáticamente en:
- 🌐 Frontend: http://localhost:5173
- 🔧 Backend: http://localhost:5000

---

## 📋 Requisitos (Todo automático)

- ✅ **Git**: Se instala automáticamente si no existe
- ✅ **Node.js**: Se instala automáticamente si no existe
- ✅ **Repositorio**: Se clona automáticamente desde GitHub
- ✅ **Dependencias**: Se instalan automáticamente
- ✅ **Base de datos**: Solo necesitas configurar Neon (ver abajo)

---

## ☁️ Configurar Base de Datos (1ra vez)

1. **Crear cuenta en Neon**: https://neon.tech
2. **Crear proyecto** y copiar connection string
3. **Editar `backend/.env`**:
   ```env
   DATABASE_URL=postgresql://usuario:password@ep-xxxx.neon.tech/gestion_clientes?sslmode=require
   ```

---

## 🔧 ¿Qué hace exactamente el script?

### Fase 1: Preparación
- 📦 **Instala Git** (si no está presente)
- 📥 **Clona repositorio** desde `https://github.com/jdmsoftware1/gestion_clientes.git`
- 📦 **Instala Node.js** (si no está presente)

### Fase 2: Configuración
- 📦 **Instala dependencias** del backend
- 📦 **Instala dependencias** del frontend
- 🔧 **Inicia servicios** en segundo plano

### Fase 3: Verificación
- ✅ **Espera confirmación** de que backend está listo (puerto 5000)
- ✅ **Espera confirmación** de que frontend está listo (puerto 5173)
- 🎉 **Muestra URLs** de acceso

---

## 🎯 Primeros Pasos en la Aplicación

1. **Abrir navegador**: http://localhost:5173

2. **Explorar Clientes**: 
   - **Click en cualquier fila** de cliente para ver sus detalles completos
   - Información financiera, estado, fechas de creación/actualización
   - **Desde el modal de detalles puedes:**
     - Registrar ventas directamente con el botón 🛒 "Registrar Venta"
     - Registrar pagos directamente con el botón 💳 "Registrar Pago"
     - Ir directamente a editar el cliente

3. **Crear tu primer vendedor**:
   - Menú ≡ → Vendedores → "Nuevo Vendedor"
   - Nombre: "Carlos García"
   - Email: carlos@example.com

4. **Crear cliente**:
   - Menú → Clientes → "Nuevo Cliente"
   - Nombre: "María López"
   - Teléfono: 600123456
   - Dirección: "Calle Mayor 123, Madrid"
   - Vendedor: "Carlos García"

5. **Crear venta**:
   - Menú → Ventas → "Nueva Venta"
   - Cliente: "María López"
   - Monto: 500€
   - Descripción: "Venta inicial"

6. **Ver dashboard**: Deuda total aparecerá en 500€

7. **Crear pago**:
   - Menú → Pagos → "Nuevo Pago"
   - Cliente: "María López"
   - Monto: 200€
   - Método: "Efectivo"

8. **Ver resultado**: Deuda ahora es 300€

---

## 📊 Funcionalidades Disponibles

### Dashboard Principal
- 📈 **KPIs en tiempo real**: Deuda total, ventas y pagos
- 👥 **Ranking de vendedores** por rendimiento
- 👤 **Clientes morosos** (>60 días sin pagar)
- 🎯 **Oportunidades de venta** (deuda baja)

### Gestión Completa
- 🏪 **CRUD completo**: Vendedores, Clientes, Ventas, Pagos
- 💰 **Cuenta corriente automática**
- 📅 **Cierres de mes personalizados**
- 📊 **Analytics históricos** (2021-2024)

### Analytics Históricos
- 📅 **Filtros por año/mes**
- 📊 **557 ventas + 9,039 pagos históricos**
- 🏆 **Top clientes y productos**
- 📈 **Tendencias históricas**

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| Node.js no instala | Instalar manualmente desde nodejs.org |
| Neon no conecta | Verificar DATABASE_URL en backend/.env |
| Puertos ocupados | Ver `SETUP_WINDOWS.md` para liberar puertos |
| Error de permisos | Ejecutar PowerShell como Administrador |

---

## 🔄 Auto-Actualización

El script se **actualiza automáticamente** cuando hay nuevas versiones en GitHub:
- 📦 Detecta cambios en el repositorio
- 💾 Hace backup de cambios locales
- 🔄 Actualiza a última versión
- 🔁 Se reinicia automáticamente

---

## 🎨 Comandos de Desarrollo (Opcional)

```powershell
# Ejecutar individualmente si es necesario:
cd backend && npm start    # Backend en producción
cd frontend && npm run dev # Frontend en desarrollo

# Comandos útiles:
npm run migrate  # Sincronizar base de datos
npm run build    # Compilar frontend para producción
```

---

## 📞 ¿Necesitas más ayuda?

- 📖 **Documentación completa**: `README.md`
- 🪟 **Setup detallado**: `SETUP_WINDOWS.md`
- 🐛 **Solución de problemas**: `SETUP_WINDOWS.md#solucion-de-problemas`

---

**Versión**: 2.1.0
**Instalación**: 100% Automática
**Tiempo**: 1 minuto
**Última actualización**: Octubre 2025