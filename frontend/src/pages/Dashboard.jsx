import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { dashboardAPI, monthClosuresAPI, testsAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const DashboardCard = ({ title, value, currency = false }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5">
        {currency ? '€' : ''} {typeof value === 'number' ? value.toFixed(2) : value}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { selectedSalesperson } = useSalesperson();
  const [kpis, setKpis] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [delinquent, setDelinquent] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search filters
  const [delinquentSearch, setDelinquentSearch] = useState('');
  const [opportunitiesSearch, setOpportunitiesSearch] = useState('');
  const [minDebt, setMinDebt] = useState('');
  const [maxDebt, setMaxDebt] = useState('');
  
  // Date filters - Inicializar con últimos 30 días reales
  const getInitialDates = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    return {
      dateFrom: thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: today.toISOString().split('T')[0]
    };
  };
  
  const initialDates = getInitialDates();
  const [dateFrom, setDateFrom] = useState(initialDates.dateFrom);
  const [dateTo, setDateTo] = useState(initialDates.dateTo);
  const [periodLabel, setPeriodLabel] = useState('Últimos 30 días');
  
  // Month closure states
  const [openClosureModal, setOpenClosureModal] = useState(false);
  const [closureName, setClosureName] = useState('');
  const [closureDescription, setClosureDescription] = useState('');
  const [closures, setClosures] = useState([]);
  const [selectedClosure, setSelectedClosure] = useState(null);
  
  // Tests states
  const [openTestsModal, setOpenTestsModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);
  

  useEffect(() => {
    if (selectedSalesperson) {
      fetchDashboardData();
      fetchClosures();
    }
  }, [selectedSalesperson]);
  
  // Filter delinquent clients
  const filteredDelinquent = useMemo(() => {
    return delinquent.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(delinquentSearch.toLowerCase()) ||
                       item.salesperson_name.toLowerCase().includes(delinquentSearch.toLowerCase());
      const debt = parseFloat(item.debt);
      const minMatch = minDebt === '' || debt >= parseFloat(minDebt);
      const maxMatch = maxDebt === '' || debt <= parseFloat(maxDebt);
      return nameMatch && minMatch && maxMatch;
    });
  }, [delinquent, delinquentSearch, minDebt, maxDebt]);
  
  // Filter opportunities
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(opportunitiesSearch.toLowerCase()) ||
                       item.salesperson_name.toLowerCase().includes(opportunitiesSearch.toLowerCase());
      const debt = parseFloat(item.debt);
      const minMatch = minDebt === '' || debt >= parseFloat(minDebt);
      const maxMatch = maxDebt === '' || debt <= parseFloat(maxDebt);
      return nameMatch && minMatch && maxMatch;
    });
  }, [opportunities, opportunitiesSearch, minDebt, maxDebt]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {};
      
      // Añadir filtros de fecha si están definidos
      if (dateFrom && dateTo) {
        params.dateFrom = dateFrom;
        params.dateTo = dateTo;
      }
      
      const [kpisData, rankingsData, collectorsData, delinquentData, opportunitiesData] = await Promise.all([
        dashboardAPI.getKPIs(params),
        dashboardAPI.getSalespersonRankings(params),
        dashboardAPI.getCollectorsRankings(params),
        dashboardAPI.getDelinquentClients(params),
        dashboardAPI.getSalesOpportunities(params),
      ]);

      setKpis(kpisData.data);
      setRankings(rankingsData.data);
      setCollectors(collectorsData.data);
      setDelinquent(delinquentData.data);
      setOpportunities(opportunitiesData.data);
      
      // Actualizar etiqueta del período
      if (kpisData.data.periodLabel) {
        setPeriodLabel(kpisData.data.periodLabel);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para establecer período personalizado
  const handleDateFilter = () => {
    if (dateFrom && dateTo) {
      fetchDashboardData();
    }
  };

  // Función para "cerrar mes" - establecer desde el día actual del mes anterior hasta hoy
  const handleCloseMonth = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, dayOfMonth);
    
    const fromDate = lastMonth.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    
    setDateFrom(fromDate);
    setDateTo(toDate);
    
    // Actualizar automáticamente
    setTimeout(() => {
      fetchDashboardData();
    }, 100);
  };

  // Función para resetear a últimos 30 días
  const handleResetPeriod = () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dateFromStr = thirtyDaysAgo.toISOString().split('T')[0];
    const dateToStr = today.toISOString().split('T')[0];
    
    setDateFrom(dateFromStr);
    setDateTo(dateToStr);
    setPeriodLabel('Últimos 30 días');
    setSelectedClosure(null);
    
    // Actualizar dashboard con las fechas calculadas
    setTimeout(() => {
      fetchDashboardData();
    }, 100);
  };

  // Función para obtener cierres
  const fetchClosures = async () => {
    try {
      const params = selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {};
      const response = await monthClosuresAPI.getAll(params);
      setClosures(response.data);
    } catch (error) {
      console.error('Error fetching closures:', error);
    }
  };

  // Función para crear un nuevo cierre
  const handleCreateClosure = async () => {
    try {
      if (!closureName.trim()) {
        alert('Por favor, introduce un nombre para el cierre');
        return;
      }

      const closureData = {
        name: closureName,
        description: closureDescription,
        salespersonId: selectedSalesperson?.id !== 'TODOS' ? selectedSalesperson.id : null,
        closedBy: 'Usuario' // Aquí podrías usar un sistema de autenticación
      };

      await monthClosuresAPI.create(closureData);
      
      // Limpiar formulario y cerrar modal
      setClosureName('');
      setClosureDescription('');
      setOpenClosureModal(false);
      
      // Refrescar datos
      fetchClosures();
      fetchDashboardData();
      
      alert('Cierre creado exitosamente');
    } catch (error) {
      console.error('Error creating closure:', error);
      alert('Error al crear el cierre: ' + error.message);
    }
  };

  // Función para aplicar un cierre seleccionado
  const handleApplyClosure = (closure) => {
    if (closure) {
      setDateFrom(closure.dateFrom);
      setDateTo(closure.dateTo);
      setSelectedClosure(closure);
      setPeriodLabel(closure.name);
      
      // Actualizar dashboard con las fechas del cierre
      setTimeout(() => {
        fetchDashboardData();
      }, 100);
    }
  };

  // Función para ejecutar tests del dashboard
  const handleRunTests = async () => {
    try {
      setRunningTests(true);
      setOpenTestsModal(true);
      const response = await testsAPI.runDashboardTests();
      setTestResults(response.data);
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults({
        summary: { status: 'ERROR', totalTests: 0, passedTests: 0, failedTests: 1 },
        tests: [{ test: 'Connection Test', status: 'FAIL', message: error.message }],
        error: error.message
      });
    } finally {
      setRunningTests(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRunTests}
            disabled={runningTests}
            sx={{ minWidth: '120px' }}
          >
            {runningTests ? 'Ejecutando...' : '🧪 Tests'}
          </Button>
          {selectedSalesperson && (
            <Chip 
              label={selectedSalesperson.name} 
              color={selectedSalesperson.id === 'TODOS' ? 'primary' : 'default'}
              variant="outlined"
              sx={{ fontSize: '1em', py: 3 }}
            />
          )}
        </Box>
      </Box>

      {/* Controles de Fecha y Cierres */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filtros de Período - {periodLabel}
        </Typography>
        
        {/* Selector de Cierres Guardados */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Autocomplete
            options={closures}
            getOptionLabel={(option) => `${option.name} (${option.dateFrom} - ${option.dateTo})`}
            value={selectedClosure}
            onChange={(event, newValue) => handleApplyClosure(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Cierres Guardados" size="small" />
            )}
            sx={{ minWidth: '300px' }}
          />
          <Button 
            variant="outlined" 
            onClick={handleResetPeriod}
            sx={{ minWidth: '120px' }}
          >
            Últimos 30 días
          </Button>
        </Stack>

        {/* Controles de Fecha Manual */}
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
          <Button 
            variant="contained" 
            onClick={handleDateFilter}
            disabled={!dateFrom || !dateTo}
            sx={{ minWidth: '120px' }}
          >
            Aplicar Filtro
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={() => setOpenClosureModal(true)}
            sx={{ minWidth: '120px' }}
          >
            Cerrar Mes
          </Button>
        </Stack>
      </Paper>

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard title="Deuda Total" value={kpis?.totalDebt} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard title={`Ventas ${periodLabel}`} value={kpis?.totalSalesLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard title={`Pagos ${periodLabel}`} value={kpis?.totalPaymentsLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard title={`Devoluciones ${periodLabel}`} value={kpis?.totalReturnsLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <DashboardCard title="Neto (Ventas - Pagos - Dev.)" value={(kpis?.totalSalesLast30Days || 0) - (kpis?.totalPaymentsLast30Days || 0) - (kpis?.totalReturnsLast30Days || 0)} currency />
        </Grid>
      </Grid>

      {/* Rankings */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
              Ranking de Vendedores ({periodLabel})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="right">Total Vendido</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankings.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">€ {parseFloat(item.total_sold).toFixed(2)}</TableCell>
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
              Ranking de Cobradores ({periodLabel})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="right">Total Cobrado</TableCell>
                    <TableCell align="right">Pagos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collectors.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">€ {parseFloat(item.total_collected).toFixed(2)}</TableCell>
                      <TableCell align="right">{item.payment_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Delinquent Clients */}
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Clientes Morosos (Top 10)
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eee' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o vendedor"
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
                <TableCell>Teléfono</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell align="right">Deuda</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDelinquent.map((item, idx) => (
                <TableRow key={idx} sx={{ backgroundColor: '#ffebee' }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.salesperson_name}</TableCell>
                  <TableCell align="right">€ {parseFloat(item.debt).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Sales Opportunities */}
      <Paper>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Clientes para Vender (Deuda &lt; 75€)
          </Typography>
        </Box>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #eee' }}>
          <TextField
            size="small"
            placeholder="Buscar por nombre o vendedor"
            value={opportunitiesSearch}
            onChange={(e) => setOpportunitiesSearch(e.target.value)}
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
                <TableCell>Teléfono</TableCell>
                <TableCell>Vendedor</TableCell>
                <TableCell align="right">Deuda</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOpportunities.map((item, idx) => (
                <TableRow key={idx} sx={{ backgroundColor: '#e8f5e9' }}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.phone}</TableCell>
                  <TableCell>{item.salesperson_name}</TableCell>
                  <TableCell align="right">€ {parseFloat(item.debt).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


      {/* Modal para Crear Cierre */}
      <Dialog open={openClosureModal} onClose={() => setOpenClosureModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nuevo Cierre de Mes</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Nombre del Cierre"
              value={closureName}
              onChange={(e) => setClosureName(e.target.value)}
              placeholder="Ej: Primer Cierre Octubre, Cierre Navidad..."
              fullWidth
              required
            />
            <TextField
              label="Descripción (Opcional)"
              value={closureDescription}
              onChange={(e) => setClosureDescription(e.target.value)}
              placeholder="Descripción adicional del cierre..."
              multiline
              rows={3}
              fullWidth
            />
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Período del cierre:</strong><br/>
                Este cierre abarcará desde el último cierre hasta hoy ({new Date().toLocaleDateString()}).
                {selectedSalesperson?.id !== 'TODOS' && (
                  <>
                    <br/><strong>Vendedor:</strong> {selectedSalesperson?.name}
                  </>
                )}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClosureModal(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateClosure} 
            variant="contained"
            disabled={!closureName.trim()}
          >
            Crear Cierre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Tests */}
      <Dialog 
        open={openTestsModal} 
        onClose={() => setOpenTestsModal(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { maxHeight: '80vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">🧪 Batería de Tests del Dashboard</Typography>
          {testResults?.summary && (
            <Chip 
              label={`${testResults.summary.passedTests}/${testResults.summary.totalTests} Tests`}
              color={testResults.summary.status === 'ALL_PASS' ? 'success' : 
                     testResults.summary.status === 'MOSTLY_PASS' ? 'warning' : 'error'}
              variant="outlined"
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {runningTests ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography sx={{ mt: 2 }}>Ejecutando tests...</Typography>
            </Box>
          ) : testResults ? (
            <Box>
              {/* Resumen */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: 
                testResults.summary.status === 'ALL_PASS' ? '#e8f5e8' : 
                testResults.summary.status === 'MOSTLY_PASS' ? '#fff3e0' : '#ffebee'
              }}>
                <Typography variant="h6" gutterBottom>
                  📊 Resumen: {testResults.summary.successRate} de éxito
                </Typography>
                <Typography variant="body2">
                  ✅ Pasados: {testResults.summary.passedTests} | 
                  ❌ Fallidos: {testResults.summary.failedTests} | 
                  📅 {new Date(testResults.timestamp).toLocaleString()}
                </Typography>
              </Paper>

              {/* Lista de Tests */}
              <Typography variant="h6" gutterBottom>Resultados Detallados:</Typography>
              {testResults.tests.map((test, index) => (
                <Paper 
                  key={index} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: `1px solid ${test.status === 'PASS' ? '#4caf50' : '#f44336'}`,
                    backgroundColor: test.status === 'PASS' ? '#f1f8e9' : '#ffebee'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {test.status === 'PASS' ? '✅' : '❌'} {test.test}
                      </Typography>
                      {test.message && (
                        <Typography variant="body2" sx={{ mt: 0.5, color: '#666' }}>
                          {test.message}
                        </Typography>
                      )}
                      {test.data && (
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontFamily: 'monospace' }}>
                          {JSON.stringify(test.data, null, 2)}
                        </Typography>
                      )}
                    </Box>
                    <Chip 
                      label={test.status} 
                      size="small"
                      color={test.status === 'PASS' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                </Paper>
              ))}

              {testResults.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Error General:</strong> {testResults.error}
                  </Typography>
                </Alert>
              )}
            </Box>
          ) : (
            <Typography>No hay resultados de tests disponibles.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTestsModal(false)}>
            Cerrar
          </Button>
          <Button 
            onClick={handleRunTests} 
            variant="contained"
            disabled={runningTests}
          >
            {runningTests ? 'Ejecutando...' : 'Ejecutar Tests'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;