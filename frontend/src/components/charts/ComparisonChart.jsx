import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography, Box } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ComparisonChart = ({ title, data = [], type = 'sales' }) => {
  const sortedData = [...data].sort((a, b) => {
    if (type === 'sales') {
      return parseFloat(b.sales_amount) - parseFloat(a.sales_amount);
    } else {
      return parseFloat(b.payments_amount) - parseFloat(a.payments_amount);
    }
  });

  const chartData = {
    labels: sortedData.map(item => item.salesperson_name),
    datasets: [
      {
        label: 'Ventas',
        data: sortedData.map(item => parseFloat(item.sales_amount) || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Pagos',
        data: sortedData.map(item => parseFloat(item.payments_amount) || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Deuda Pendiente',
        data: sortedData.map(item => parseFloat(item.pending_debt) || 0),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
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
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: €${context.parsed.y.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Vendedores'
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
        <Bar data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

export default ComparisonChart;
