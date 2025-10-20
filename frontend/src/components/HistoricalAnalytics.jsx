import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  Stack,
} from '@mui/material';
import { dashboardAPI, salespeopleAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const HistoricalAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('TODOS');
  const [salespeople, setSalespeople] = useState([]);
  
  // Filtros de búsqueda
  const [delinquentSearch, setDelinquentSearch] = useState('');
  const [opportunitiesSearch, setOpportunitiesSearch] = useState('');
  const [minDebt, setMinDebt] = useState('');
  const [maxDebt, setMaxDebt] = useState('');

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
      
      // Enviar legacyCode en lugar de UUID para compatibilidad con datos históricos
      if (selectedSalesperson && selectedSalesperson !== 'TODOS') {
        const selectedSalespersonData = salespeople.find(s => s.id === selectedSalesperson);
        if (selectedSalespersonData && selectedSalespersonData.legacyCode) {
          params.salespersonId = selectedSalespersonData.legacyCode.toString();
          console.log('Frontend - Selected salesperson:', selectedSalespersonData.name, 'with legacy code:', selectedSalespersonData.legacyCode);
        } else {
          console.warn('Frontend - No legacy code found for salesperson:', selectedSalespersonData);
        }
      }
      
      console.log('Frontend - Sending params:', params);
      
      const response = await dashboardAPI.getHistoricalAnalytics(params);
      setData(response.data);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de vendedores
  const fetchSalespeople = async () => {
    try {
      const response = await salespeopleAPI.getAll();
      // Asignar códigos legacy basados en nombres para compatibilidad con datos históricos
      const salespeopleWithCodes = response.data.map((salesperson) => {
        let legacyCode = null;
        
        // Mapeo de nombres a códigos legacy históricos
        const nameToCodeMap = {
          'BegoJi': 6,
          'Bego': 3,
          'David': 1,
          'Yaiza': 5,
          'fe': 1,
          'Jimenez': 4
        };
        
        // Buscar por nombre exacto o parcial
        for (const [name, code] of Object.entries(nameToCodeMap)) {
          if (salesperson.name.toLowerCase().includes(name.toLowerCase())) {
            legacyCode = code;
            break;
          }
        }
        
        return {
          ...salesperson,
          legacyCode: legacyCode
        };
      });
      
      setSalespeople([{ id: 'TODOS', name: 'Todos los vendedores', legacyCode: null }, ...salespeopleWithCodes]);
    } catch (error) {
      console.error('Error fetching salespeople:', error);
    }
  };

  useEffect(() => {
    fetchSalespeople();
    fetchHistoricalData();
  }, []);

  const handleFilter = () => {
    fetchHistoricalData();
  };

  const resetFilters = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedSalesperson('TODOS');
    setTimeout(() => {
      fetchHistoricalData();
    }, 100);
  };

  // Filtrar clientes morosos
  const filteredDelinquentClients = useMemo(() => {
    if (!data?.delinquentClients) return [];
    return data.delinquentClients.filter(client => {
      const matchesSearch = !delinquentSearch ||
        `${client.name} ${client.lastname}`.toLowerCase().includes(delinquentSearch.toLowerCase());
      const clientDebt = parseFloat(client.total_paid || 0);
      const matchesMin = !minDebt || clientDebt >= parseFloat(minDebt);
      const matchesMax = !maxDebt || clientDebt <= parseFloat(maxDebt);
      return matchesSearch && matchesMin && matchesMax;
    });
  }, [data?.delinquentClients, delinquentSearch, minDebt, maxDebt]);

  // Filtrar oportunidades
  const filteredOpportunities = useMemo(() => {
    if (!data?.salesOpportunities) return [];
    return data.salesOpportunities.filter(client => {
      const matchesSearch = !opportunitiesSearch ||
        `${client.name} ${client.lastname}`.toLowerCase().includes(opportunitiesSearch.toLowerCase());
      return matchesSearch;
    });
  }, [data?.salesOpportunities, opportunitiesSearch]);

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
          Filtros de Período y Vendedor
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
            <FormControl fullWidth size="small">
              <InputLabel>Vendedor</InputLabel>
              <Select
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
                label="Vendedor"
              >
                {salespeople.map((salesperson) => (
                  <MenuItem key={salesperson.id} value={salesperson.id}>
                    {salesperson.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={handleFilter} fullWidth>
                Aplicar Filtros
              </Button>
              <Button variant="outlined" onClick={resetFilters}>
                Limpiar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* KPIs principales */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Ventas Históricas
              </Typography>
              <Typography variant="h5" color="primary">
                € {data.totalHistoricalSales?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Pagos Históricos
              </Typography>
              <Typography variant="h5" color="success.main">
                € {data.totalHistoricalPayments?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Balance Neto
              </Typography>
              <Typography 
                variant="h5" 
                color={data.netHistoricalAmount >= 0 ? 'success.main' : 'error.main'}
              >
                € {data.netHistoricalAmount?.toFixed(2) || '0.00'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Transacciones Totales
              </Typography>
              <Typography variant="h5" color="info.main">
                {data.summary?.totalSales ? Math.round(data.summary.totalSales) : 0}
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

      {/* Rankings de Vendedores */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Ranking de Vendedores Históricos ({data.summary.periodLabel})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>ID Vendedor</TableCell>
                    <TableCell align="right">Total Vendido</TableCell>
                    <TableCell align="right">Ventas</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.salespersonRankings?.slice(0, 10).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.salesperson_id}</TableCell>
                      <TableCell align="right">€ {item.total_sold?.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.total_sales}</TableCell>
                      <TableCell align="right">€ {item.avg_sale?.toFixed(2)}</TableCell>
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
              Ranking de Cobradores Históricos ({data.summary.periodLabel})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>ID Vendedor</TableCell>
                    <TableCell align="right">Total Cobrado</TableCell>
                    <TableCell align="right">Pagos</TableCell>
                    <TableCell align="right">Promedio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.collectorsRankings?.slice(0, 10).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.salesperson_id}</TableCell>
                      <TableCell align="right">€ {item.total_collected?.toFixed(2)}</TableCell>
                      <TableCell align="right">{item.total_payments}</TableCell>
                      <TableCell align="right">€ {item.avg_payment?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Clientes Morosos Históricos */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Clientes Morosos Históricos (Top 10)
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eee' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre"
            value={delinquentSearch}
            onChange={(e) => setDelinquentSearch(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
          />
          <TextField
            size="small"
            placeholder="Deuda mín"
            type="number"
            value={minDebt}
            onChange={(e) => setMinDebt(e.target.value)}
            inputProps={{ step: '0.01' }}
            sx={{ width: '120px' }}
          />
          <TextField
            size="small"
            placeholder="Deuda máx"
            type="number"
            value={maxDebt}
            onChange={(e) => setMaxDebt(e.target.value)}
            inputProps={{ step: '0.01' }}
            sx={{ width: '120px' }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Total Pagado</TableCell>
                <TableCell align="right">Último Pago</TableCell>
                <TableCell align="right">Promedio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDelinquentClients.slice(0, 10).map((item, idx) => (
                <TableRow key={idx} sx={{ backgroundColor: '#ffebee' }}>
                  <TableCell>{item.name} {item.lastname}</TableCell>
                  <TableCell align="right">€ {item.total_paid?.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.last_payment ? new Date(item.last_payment).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell align="right">€ {item.avg_payment?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Oportunidades Históricas */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Oportunidades Históricas (&lt; 50€)
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eee' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre"
            value={opportunitiesSearch}
            onChange={(e) => setOpportunitiesSearch(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Compras</TableCell>
                <TableCell align="right">Total Gastado</TableCell>
                <TableCell align="right">Última Compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOpportunities.slice(0, 10).map((item, idx) => (
                <TableRow key={idx} sx={{ backgroundColor: '#e8f5e8' }}>
                  <TableCell>{item.name} {item.lastname}</TableCell>
                  <TableCell align="right">
                    <Chip label={item.purchase_count} size="small" color="success" />
                  </TableCell>
                  <TableCell align="right">€ {item.total_spent?.toFixed(2)}</TableCell>
                  <TableCell align="right">{item.last_purchase ? new Date(item.last_purchase).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
