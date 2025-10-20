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

## 📋 Requisitos (Automáticos)

- ✅ **Node.js**: Se instala automáticamente
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

## 🎯 Primeros Pasos en la Aplicación

1. **Abrir navegador**: http://localhost:5173

2. **Crear tu primer vendedor**:
   - Menú ≡ → Vendedores → "Nuevo Vendedor"
   - Nombre: "Carlos García"
   - Email: carlos@example.com

3. **Crear cliente**:
   - Menú → Clientes → "Nuevo Cliente"
   - Nombre: "María López"
   - Teléfono: 600123456
   - Vendedor: "Carlos García"

4. **Crear venta**:
   - Menú → Ventas → "Nueva Venta"
   - Cliente: "María López"
   - Monto: 500€
   - Descripción: "Venta inicial"

5. **Ver dashboard**: Deuda total aparecerá en 500€

6. **Crear pago**:
   - Menú → Pagos → "Nuevo Pago"
   - Cliente: "María López"
   - Monto: 200€
   - Método: "Efectivo"

7. **Ver resultado**: Deuda ahora es 300€

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