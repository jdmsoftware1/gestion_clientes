import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { dashboardAPI } from '../api/services';

const HistoricalAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const years = ['2020', '2021', '2022', '2023', '2024'];
  const months = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (selectedYear) params.year = selectedYear;
      if (selectedMonth) params.month = selectedMonth;
      
      const response = await dashboardAPI.getHistoricalAnalytics(params);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const handleFilter = () => {
    fetchHistoricalData();
  };

  const resetFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setTimeout(() => {
      fetchHistoricalData();
    }, 100);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="info">No hay datos históricos disponibles</Alert>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        📊 Analytics Históricos - {data.summary.periodLabel}
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtros de Período
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Año</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Año"
              >
                <MenuItem value="">Todos los años</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Mes</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Mes"
                disabled={!selectedYear}
              >
                <MenuItem value="">Todo el año</MenuItem>
                {months.map((month) => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" onClick={handleFilter} fullWidth>
              Aplicar Filtros
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="outlined" onClick={resetFilters} fullWidth>
              Limpiar Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Ventas Históricas
              </Typography>
              <Typography variant="h5" color="primary">
                € {data.summary.totalSales.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Pagos Históricos
              </Typography>
              <Typography variant="h5" color="success.main">
                € {data.summary.totalPayments.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Balance Neto
              </Typography>
              <Typography 
                variant="h5" 
                color={data.summary.netBalance >= 0 ? 'success.main' : 'error.main'}
              >
                € {data.summary.netBalance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ventas por Período */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Ventas por Período
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Transacciones</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.salesByPeriod.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.month}/{item.year}</TableCell>
                      <TableCell align="right">{item.total_transactions}</TableCell>
                      <TableCell align="right">€ {item.total_sales.toFixed(2)}</TableCell>
                      <TableCell align="right">€ {item.avg_sale.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Pagos por Período
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Período</TableCell>
                    <TableCell align="right">Pagos</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.paymentsByPeriod.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.month}/{item.year}</TableCell>
                      <TableCell align="right">{item.total_payments}</TableCell>
                      <TableCell align="right">€ {item.total_collected.toFixed(2)}</TableCell>
                      <TableCell align="right">€ {item.avg_payment.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Clientes y Productos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Top 10 Clientes Históricos
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Compras</TableCell>
                    <TableCell align="right">Total Gastado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topCustomers.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {item.customer_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {item.customer_lastname}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={item.total_purchases} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        € {item.total_spent.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Top 10 Productos Históricos
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Vendidos</TableCell>
                    <TableCell align="right">Ingresos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topProducts.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {item.product_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={item.times_sold} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="right">
                        € {item.total_revenue.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalAnalytics;
