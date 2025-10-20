# INSTALACIÓN DE DEPENDENCIAS PARA GRÁFICOS

Para que funcionen los gráficos de análisis avanzados, necesitas instalar Chart.js:

```bash
cd frontend
npm install chart.js react-chartjs-2
```

## Dependencias añadidas:
- **chart.js**: Librería de gráficos
- **react-chartjs-2**: Wrapper de Chart.js para React

## Componentes creados:
- `TrendChart.jsx`: Gráficos de líneas para tendencias temporales
- `ComparisonChart.jsx`: Gráficos de barras para comparar vendedores  
- `DebtDistributionChart.jsx`: Gráficos circulares para distribución de deuda
- `KPICard.jsx`: Tarjetas para mostrar KPIs con iconos y tendencias
- `Analytics.jsx`: Página principal de análisis avanzados

## Uso:
1. Instalar dependencias
2. Añadir ruta en App.js para `/analytics`
3. Los gráficos estarán disponibles en la nueva página de Analytics
