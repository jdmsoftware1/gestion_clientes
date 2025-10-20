# 🧪 GUÍA RÁPIDA - TEST ANALYTICS

## 🚀 **PASOS PARA PROBAR INMEDIATAMENTE**

### **1. Reiniciar Backend (OBLIGATORIO)**
```bash
# Detén el servidor actual (Ctrl+C)
# Luego reinicia:
cd backend
npm start
```

### **2. Reiniciar Frontend**
```bash
# En otra terminal:
cd frontend
npm start
```

### **3. Probar las Nuevas Funcionalidades**

#### **🧪 ENTORNO DE PRUEBAS (RECOMENDADO):**
- **Test Analytics**: http://localhost:5173/test-analytics
- **Test Alertas**: http://localhost:5173/test-alerts

#### **📊 FUNCIONALIDADES REALES:**
- **Analytics Reales**: http://localhost:5173/analytics
- **Alertas Reales**: http://localhost:5173/alerts

## 🎯 **QUÉ VERÁS EN EL ENTORNO DE TEST**

### **En `/test-analytics`:**
- ✅ Botón "Ejecutar Todos los Tests"
- ✅ 5 tests diferentes con datos simulados
- ✅ Resultados JSON visibles
- ✅ Logs en consola del navegador (F12)

### **En `/test-alerts`:**
- ✅ Alertas simuladas con diferentes prioridades
- ✅ Resumen con contadores
- ✅ Detalles expandibles
- ✅ Interfaz completa de alertas

## 🔧 **VERIFICACIÓN RÁPIDA**

### **Probar API de Test:**
```bash
curl http://localhost:5000/api/analytics/test/status
```

### **Probar Test Específico:**
```bash
curl http://localhost:5000/api/analytics/test/kpis
```

## 🎨 **NAVEGACIÓN**

**En el menú lateral verás:**
- 📊 Análisis Avanzados (datos reales)
- 🔔 Alertas (datos reales)
- 🧪 Test Analytics (datos simulados) ⭐
- 🧪 Test Alertas (datos simulados) ⭐

## ⚡ **SOLUCIÓN DE PROBLEMAS**

### **Si no ves las opciones de test en el menú:**
1. Asegúrate de haber reiniciado el frontend
2. Limpia caché del navegador (Ctrl+F5)
3. Verifica que no hay errores en consola

### **Si las APIs de test no funcionan:**
1. Reinicia el servidor backend (OBLIGATORIO)
2. Verifica que el puerto 5000 esté libre
3. Comprueba los logs del servidor

### **Si ves errores 500:**
- Usa las rutas de test (`/test-analytics`) en lugar de las reales
- Las rutas de test usan datos simulados y no fallan

## 🎉 **RESULTADO ESPERADO**

**Después de seguir estos pasos:**
- ✅ Verás 4 nuevas opciones en el menú
- ✅ Los tests pasarán todos con ✅
- ✅ Verás datos simulados realistas
- ✅ No habrá errores 500 en las rutas de test
- ✅ Podrás probar todas las funcionalidades sin riesgo

---

## 🚀 **¡EMPIEZA AQUÍ!**

**Ve directamente a: http://localhost:5173/test-analytics después de reiniciar ambos servidores.**
