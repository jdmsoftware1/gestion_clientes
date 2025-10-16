# Quick Start - Tests de Endpoints

## 🚀 En 30 Segundos

1. **Asegúrate que el servidor está corriendo:**
   ```bash
   npm start
   ```

2. **En otra terminal, ejecuta los tests:**
   ```bash
   npm test
   ```

3. **Deberías ver:**
   ```
   ✓ GET /api/salespeople
   ✓ GET /api/clients (sin filtro)
   ✓ GET /clients?salespersonId=...
   ✓ GET /api/dashboard/kpis
   ✓ GET /api/dashboard/delinquent
   
   Exitosos: 5
   Fallidos: 0
   ```

---

## 📊 ¿Qué Prueban los Tests?

### Test Rápido (`npm test`)
Verifica que los endpoints básicos funcionan:
- ✅ Los vendedores se cargan correctamente
- ✅ Los clientes se obtienen sin errores
- ✅ El filtro por vendedor funciona
- ✅ El dashboard carga los KPIs
- ✅ El dashboard muestra clientes con deuda

**Tiempo:** ~2 segundos

### Test Completo (`npm test:complete`)
Verifica todos los endpoints del sistema:
- ✅ Vendedores
- ✅ Clientes (GET, GET con filtro, GET por ID)
- ✅ Ventas (GET, GET con filtro)
- ✅ Pagos
- ✅ Dashboard (3 endpoints)

**Tiempo:** ~3 segundos

---

## 🔧 Usar Tests en CI/CD

Si quieres automatizar los tests:

```bash
# Terminal 1: Inicia el servidor en background
npm start &
sleep 2  # Espera a que inicie

# Terminal 2: Ejecuta tests
npm test:complete

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Todos los tests pasaron"
else
  echo "❌ Algunos tests fallaron"
  exit 1
fi
```

---

## 🐛 Si los Tests Fallan

### "Connection refused" o "ECONNREFUSED"
El servidor no está corriendo. Ejecuta:
```bash
npm start
```

### "Cannot find module 'axios'"
Instala las dependencias:
```bash
npm install
```

### "there is no parameter $1"
Bug en una query. Verifica que todas las queries usen `?` en lugar de `$1`.

### Timeout (>15 segundos)
El servidor está lento. Reinicia:
```bash
npm start
```

---

## 📈 Ejemplo de Salida Exitosa

```
=== TEST DE ENDPOINTS ===

1. Obteniendo vendedores...

✓ GET /api/salespeople
  Usando vendedor: BEGO (b556996b-e014-4859-b90e-250b21dfdd56)

2. Probando endpoint de clientes...
✓ GET /api/clients (sin filtro)

3. Probando filtro de vendedor...
✓ GET /api/clients?salespersonId=b556996b-e014-4859-b90e-250b21dfdd56
  Primer cliente: Pepe (d2a53ef9-609c-43fa-8fdd-d92cefacb817)

4. Probando dashboard...
✓ GET /api/dashboard/kpis?salespersonId=b556996b-e014-4859-b90e-250b21dfdd56
✓ GET /api/dashboard/delinquent?salespersonId=b556996b-e014-4859-b90e-250b21dfdd56

=== RESUMEN ===
Exitosos: 5
Fallidos: 0
Total: 5

✅ Todos los tests pasaron!
```

---

## 💡 Pro Tips

### 1. Tests mientras desarrollas
Abre dos terminales:
```bash
# Terminal 1
npm start

# Terminal 2 (ejecuta tests cuando quieras)
npm test
```

### 2. Monitorear cambios
Si cambias código en el backend, los tests auto-detectan si algo se rompió:
```bash
npm test  # Ejecuta después de cada cambio
```

### 3. Debugging
Si un test falla, mira el error exacto:
```bash
node test/endpoints.test.js
# Verás el error específico del endpoint que falló
```

### 4. Agregar tests nuevos
Edita `test/endpoints.test.js` o `test/complete.test.js` para agregar más verificaciones.

---

## 📚 Archivos Relacionados

- `README.md` - Documentación detallada
- `FIXES_SUMMARY.md` - Qué errores se corrigieron y cómo
- `endpoints.test.js` - Test rápido (fuente)
- `complete.test.js` - Test completo (fuente)

---

## ✅ Verificación Final

Después de ejecutar `npm test` exitosamente:

1. ✅ El servidor backend está funcionando
2. ✅ La base de datos está conectada
3. ✅ Todos los endpoints responden correctamente
4. ✅ Los filtros funcionan
5. ✅ El frontend puede conectarse sin errores

**¡Estás listo para usar la aplicación!**

---

## 🚨 Troubleshooting

| Problema | Solución |
|----------|----------|
| `ECONNREFUSED` | Inicia el servidor: `npm start` |
| `Cannot find module` | Instala dependencias: `npm install` |
| Timeout | Reinicia el servidor |
| Error `$1` | Hay un bug en una query. Ver `FIXES_SUMMARY.md` |
| Test lento | Database podría estar lenta. Reinicia BD |

---

**¡Listo! Ahora puedes probar tu backend con confianza!** 🎉