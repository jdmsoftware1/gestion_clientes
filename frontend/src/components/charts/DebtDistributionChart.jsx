import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Paper, Typography, Box, Grid } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const DebtDistributionChart = ({ title, data = [] }) => {
  // Validar que data sea un array
  const validData = Array.isArray(data) ? data : [];
  
  const colors = [
    'rgba(75, 192, 192, 0.8)',
    'rgba(255, 99, 132, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(153, 102, 255, 0.8)',
  ];

  const borderColors = [
    'rgba(75, 192, 192, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(153, 102, 255, 1)',
  ];

  const chartData = {
    labels: validData.map(item => item.debt_range),
    datasets: [
      {
        data: validData.map(item => parseInt(item.client_count)),
        backgroundColor: colors.slice(0, validData.length),
        borderColor: borderColors.slice(0, validData.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          generateLabels: function(chart) {
            const chartData = chart.data;
            if (chartData.labels.length && chartData.datasets.length) {
              return chartData.labels.map((label, i) => {
                const dataset = chartData.datasets[0];
                const count = dataset.data[i];
                // Usar validData (el array original) en lugar de data (objeto del gráfico)
                const debtInfo = validData.find(item => item.debt_range === label);
                const totalDebt = parseFloat(debtInfo?.total_debt || 0);
                
                return {
                  text: `${label}: ${count} clientes (€${totalDebt.toFixed(0)})`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor[i],
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const count = context.parsed;
            const debtInfo = validData[context.dataIndex];
            const totalDebt = parseFloat(debtInfo?.total_debt || 0);
            const percentage = ((count / validData.reduce((sum, item) => sum + parseInt(item.client_count), 0)) * 100).toFixed(1);
            
            return [
              `${label}`,
              `${count} clientes (${percentage}%)`,
              `Deuda total: €${totalDebt.toFixed(2)}`
            ];
          }
        }
      },
    },
  };

  const totalClients = validData.reduce((sum, item) => sum + parseInt(item.client_count), 0);
  const totalDebt = validData.reduce((sum, item) => sum + parseFloat(item.total_debt), 0);

  // Si no hay datos válidos, mostrar mensaje
  if (validData.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            No hay datos de distribución de deuda disponibles
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Grid container spacing={2} sx={{ height: '320px' }}>
        <Grid item xs={12} md={8}>
          <Box sx={{ height: '100%', position: 'relative' }}>
            <Doughnut data={chartData} options={options} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="textSecondary">
              Resumen
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Total clientes:</strong> {totalClients}
            </Typography>
            <Typography variant="body2">
              <strong>Deuda total:</strong> €{totalDebt.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              <strong>Deuda promedio:</strong> €{totalClients > 0 ? (totalDebt / totalClients).toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DebtDistributionChart;
