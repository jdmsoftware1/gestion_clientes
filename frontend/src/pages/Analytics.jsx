import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  People,
  AccountBalance,
  Schedule,
  PieChart,
  Science,
  Storage
} from '@mui/icons-material';
import analyticsAPI from '../api/analyticsAPI';
import { useSalesperson } from '../context/SalespersonContext';
import TrendChart from '../components/charts/TrendChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import DebtDistributionChart from '../components/charts/DebtDistributionChart';
import KPICard from '../components/charts/KPICard';

const Analytics = () => {
  const { selectedSalesperson } = useSalesperson();
  
  // Estados para filtros
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [period, setPeriod] = useState('daily');
  const [activeTab, setActiveTab] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Estados para datos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [isDataDemo, setIsDataDemo] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);

  // Cargar datos mensuales por vendedor
  const fetchMonthlyData = async () => {
    try {
      const params = {
        year: selectedYear,
        month: selectedMonth,
        demoMode: demoMode.toString(),
        ...(selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {})
      };

      const response = await analyticsAPI.getMonthlyData(params);
      setMonthlyData(response.data);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      setMonthlyData([]);
    }
  };
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        dateFrom,
        dateTo,
        demoMode: demoMode.toString(),
        ...(selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {})
      };

      const [kpisResponse, trendsResponse, comparisonResponse] = await Promise.all([
        analyticsAPI.getAdvancedKPIs(params),
        analyticsAPI.getTrendData({ ...params, period }),
        analyticsAPI.getSalespersonComparison(params)
      ]);

      setKpis(kpisResponse.data);
      setTrendData(trendsResponse.data);
      setComparisonData(comparisonResponse.data.data || comparisonResponse.data);
      setIsDataDemo(trendsResponse.data.isDemo || comparisonResponse.data.isDemo || false);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Error al cargar los datos de análisis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSalesperson) {
      fetchAnalyticsData();
      fetchMonthlyData();
    }
  }, [selectedSalesperson, dateFrom, dateTo, period, demoMode, selectedMonth, selectedYear]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleApplyFilters = () => {
    fetchAnalyticsData();
  };

  if (!selectedSalesperson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Selecciona un vendedor para ver los análisis avanzados
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment />
          Análisis Avanzados
        </Typography>
        
        {/* Indicador de modo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isDataDemo && (
            <Chip 
              icon={<Science />}
              label="MODO DEMO" 
              color="warning" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          )}
          {!isDataDemo && !demoMode && (
            <Chip 
              icon={<Storage />}
              label="DATOS REALES" 
              color="success" 
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
          )}
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros de Análisis
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Fecha Desde"
            type="date"
            size="small"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: '150px' }}
          />
          <TextField
            label="Fecha Hasta"
            type="date"
            size="small"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: '150px' }}
          />
          <FormControl size="small" sx={{ minWidth: '120px' }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={period}
              label="Período"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="daily">Diario</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensual</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: '100px' }}>
            <InputLabel>Mes</InputLabel>
            <Select
              value={selectedMonth}
              label="Mes"
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <MenuItem value={1}>Enero</MenuItem>
              <MenuItem value={2}>Febrero</MenuItem>
              <MenuItem value={3}>Marzo</MenuItem>
              <MenuItem value={4}>Abril</MenuItem>
              <MenuItem value={5}>Mayo</MenuItem>
              <MenuItem value={6}>Junio</MenuItem>
              <MenuItem value={7}>Julio</MenuItem>
              <MenuItem value={8}>Agosto</MenuItem>
              <MenuItem value={9}>Septiembre</MenuItem>
              <MenuItem value={10}>Octubre</MenuItem>
              <MenuItem value={11}>Noviembre</MenuItem>
              <MenuItem value={12}>Diciembre</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: '100px' }}>
            <InputLabel>Año</InputLabel>
            <Select
              value={selectedYear}
              label="Año"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value={2023}>2023</MenuItem>
              <MenuItem value={2024}>2024</MenuItem>
              <MenuItem value={2025}>2025</MenuItem>
              <MenuItem value={2026}>2026</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                color="warning"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science fontSize="small" />
                Modo Demo
              </Box>
            }
          />
          
          <Button 
            variant="contained" 
            onClick={handleApplyFilters}
            disabled={loading}
            sx={{ minWidth: '120px' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Actualizar'}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Alerta informativa sobre el modo */}
      {demoMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>🎭 Modo Demo Activado</strong><br/>
          Mostrando datos simulados para demostración. Desactiva el "Modo Demo" para ver datos reales de tu base de datos.
        </Alert>
      )}
      
      {!demoMode && !loading && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>📊 Modo Real Activado</strong><br/>
          Mostrando datos reales de tu base de datos. Si no hay datos, los gráficos aparecerán vacíos.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="KPIs Avanzados" />
          <Tab label="Tendencias" />
          <Tab label="Comparativas" />
          <Tab label="Distribución" />
          <Tab label="Vista Mensual" />
        </Tabs>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <>
          {/* Tab 0: KPIs Avanzados */}
          {activeTab === 0 && kpis && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Tasa de Conversión"
                  value={kpis.conversionRate?.conversion_rate || 0}
                  unit="%"
                  icon={<TrendingUp />}
                  color="success"
                  subtitle={`${kpis.conversionRate?.clients_with_payments || 0} de ${kpis.conversionRate?.total_clients || 0} clientes`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Tiempo Promedio de Cobro"
                  value={kpis.avgCollectionTime?.avg_collection_days || 0}
                  unit=" días"
                  icon={<Schedule />}
                  color="info"
                  subtitle="Desde venta hasta pago"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Clientes con Deuda"
                  value={kpis.debtDistribution?.reduce((sum, item) => sum + parseInt(item.client_count), 0) || 0}
                  icon={<People />}
                  color="warning"
                  subtitle="Total de deudores"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <KPICard
                  title="Deuda Total"
                  value={kpis.debtDistribution?.reduce((sum, item) => sum + parseFloat(item.total_debt), 0) || 0}
                  unit="€"
                  icon={<AccountBalance />}
                  color="error"
                  subtitle="Importe pendiente"
                />
              </Grid>

              {/* Eficiencia por Vendedor */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Eficiencia por Vendedor (Ventas por Día Activo)
                  </Typography>
                  <Grid container spacing={2}>
                    {kpis.salesEfficiency?.map((seller, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <KPICard
                          title={seller.salesperson_name}
                          value={seller.sales_per_day || 0}
                          unit=" ventas/día"
                          subtitle={`${seller.total_sales} ventas en ${seller.active_days} días`}
                          color="primary"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 1: Tendencias */}
          {activeTab === 1 && trendData && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TrendChart
                  title={`Tendencias de Ventas y Pagos (${period === 'daily' ? 'Diario' : period === 'weekly' ? 'Semanal' : 'Mensual'})`}
                  salesData={trendData.salesTrend}
                  paymentsData={trendData.paymentsTrend}
                  period={period}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 2: Comparativas */}
          {activeTab === 2 && comparisonData.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ComparisonChart
                  title="Comparación entre Vendedores"
                  data={comparisonData}
                />
              </Grid>
            </Grid>
          )}

          {/* Tab 3: Distribución */}
          {activeTab === 3 && kpis?.debtDistribution && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DebtDistributionChart
                  title="Distribución de Deuda por Rangos"
                  data={kpis.debtDistribution}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, height: '400px' }}>
                  <Typography variant="h6" gutterBottom>
                    Análisis de Distribución
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {kpis.debtDistribution.map((range, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {range.debt_range}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {range.client_count} clientes - €{parseFloat(range.total_debt).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Promedio: €{(parseFloat(range.total_debt) / parseInt(range.client_count)).toFixed(2)} por cliente
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 4: Vista Mensual */}
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    📊 Vista Mensual - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Resumen mensual de ventas y pagos por vendedor (formato Excel)
                  </Typography>

                  <Box sx={{ overflowX: 'auto' }}>
                    <Table sx={{ minWidth: 800 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', minWidth: '180px' }}>
                            Vendedor
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#e8f5e9' }}>
                            Ventas
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#e8f5e9' }}>
                            Total Ventas (€)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#e3f2fd' }}>
                            Pagos
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#e3f2fd' }}>
                            Total Pagos (€)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#fff3e0' }}>
                            Deuda Pendiente (€)
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                            Clientes Activos
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlyData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#999', fontStyle: 'italic' }}>
                              No hay datos disponibles para {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </TableCell>
                          </TableRow>
                        ) : (
                          monthlyData.map((row, index) => (
                            <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                              <TableCell sx={{ fontWeight: 500, border: '1px solid #ddd' }}>
                                {row.salesperson_name}
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #ddd', backgroundColor: '#f1f8e9', fontWeight: 'bold' }}>
                                {row.total_sales}
                              </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid #ddd', backgroundColor: '#f1f8e9', fontWeight: 'bold', color: '#2E7D32' }}>
                                €{parseFloat(row.total_sales_amount || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #ddd', backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                                {row.total_payments}
                              </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid #ddd', backgroundColor: '#e3f2fd', fontWeight: 'bold', color: '#1976d2' }}>
                                €{parseFloat(row.total_payments_amount || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ border: '1px solid #ddd', backgroundColor: '#fff3e0', fontWeight: 'bold', color: parseFloat(row.pending_debt || 0) > 0 ? '#f57c00' : '#2E7D32' }}>
                                €{parseFloat(row.pending_debt || 0).toFixed(2)}
                              </TableCell>
                              <TableCell align="center" sx={{ border: '1px solid #ddd', fontWeight: 'bold' }}>
                                {row.active_clients}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                        {/* Totales */}
                        {monthlyData.length > 0 && (
                          <TableRow sx={{ backgroundColor: '#e8eaf6', borderTop: '2px solid #1976d2' }}>
                            <TableCell sx={{ fontWeight: 'bold', border: '1px solid #ddd', color: '#1976d2' }}>
                              TOTAL MENSUAL
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                              {monthlyData.reduce((sum, row) => sum + (row.total_sales || 0), 0)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#c8e6c9', color: '#2E7D32' }}>
                              €{monthlyData.reduce((sum, row) => sum + parseFloat(row.total_sales_amount || 0), 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#bbdefb' }}>
                              {monthlyData.reduce((sum, row) => sum + (row.total_payments || 0), 0)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#bbdefb', color: '#1976d2' }}>
                              €{monthlyData.reduce((sum, row) => sum + parseFloat(row.total_payments_amount || 0), 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', border: '1px solid #ddd', backgroundColor: '#ffe0b2', color: '#f57c00' }}>
                              €{monthlyData.reduce((sum, row) => sum + parseFloat(row.pending_debt || 0), 0).toFixed(2)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', border: '1px solid #ddd' }}>
                              {monthlyData.reduce((sum, row) => sum + (row.active_clients || 0), 0)}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Box>

                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      💡 Esta vista muestra datos mensuales consolidados por vendedor, similar a una hoja de Excel.
                      Permite un análisis rápido del rendimiento mensual de cada vendedor.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default Analytics;
