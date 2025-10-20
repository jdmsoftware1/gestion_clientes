import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = ({ title, salesData = [], paymentsData = [], period = 'daily' }) => {
  // Combinar todas las fechas únicas
  const allDates = [...new Set([
    ...salesData.map(item => item.period_label),
    ...paymentsData.map(item => item.period_label)
  ])].sort();

  // Crear mapas para búsqueda rápida
  const salesMap = salesData.reduce((acc, item) => {
    acc[item.period_label] = parseFloat(item.sales_amount) || 0;
    return acc;
  }, {});

  const paymentsMap = paymentsData.reduce((acc, item) => {
    acc[item.period_label] = parseFloat(item.payments_amount) || 0;
    return acc;
  }, {});

  // Preparar datos para el gráfico
  const chartData = {
    labels: allDates,
    datasets: [
      {
        label: 'Ventas',
        data: allDates.map(date => salesMap[date] || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Pagos',
        data: allDates.map(date => paymentsMap[date] || 0),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: €${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: period === 'daily' ? 'Fecha' : period === 'weekly' ? 'Semana' : 'Mes'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Importe (€)'
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '€' + value.toFixed(0);
          }
        }
      }
    }
  };

  return (
    <Paper sx={{ p: 3, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height: '320px', position: 'relative' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default TrendChart;
