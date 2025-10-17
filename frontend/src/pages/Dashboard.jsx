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
import { dashboardAPI, monthClosuresAPI } from '../api/services';
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
  const [delinquent, setDelinquent] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search filters
  const [delinquentSearch, setDelinquentSearch] = useState('');
  const [opportunitiesSearch, setOpportunitiesSearch] = useState('');
  const [minDebt, setMinDebt] = useState('');
  const [maxDebt, setMaxDebt] = useState('');
  
  // Date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [periodLabel, setPeriodLabel] = useState('Últimos 30 días');
  
  // Month closure states
  const [openClosureModal, setOpenClosureModal] = useState(false);
  const [closureName, setClosureName] = useState('');
  const [closureDescription, setClosureDescription] = useState('');
  const [closures, setClosures] = useState([]);
  const [selectedClosure, setSelectedClosure] = useState(null);

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
      
      const [kpisData, rankingsData, delinquentData, opportunitiesData] = await Promise.all([
        dashboardAPI.getKPIs(params),
        dashboardAPI.getSalespersonRankings(params),
        dashboardAPI.getDelinquentClients(params),
        dashboardAPI.getSalesOpportunities(params),
      ]);

      setKpis(kpisData.data);
      setRankings(rankingsData.data);
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
    setDateFrom('');
    setDateTo('');
    setPeriodLabel('Últimos 30 días');
    setSelectedClosure(null);
    fetchDashboardData();
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

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Dashboard
        </Typography>
        {selectedSalesperson && (
          <Chip 
            label={selectedSalesperson.name} 
            color={selectedSalesperson.id === 'TODOS' ? 'primary' : 'default'}
            variant="outlined"
            sx={{ fontSize: '1em', py: 3 }}
          />
        )}
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
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Deuda Total" value={kpis?.totalDebt} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title={`Ventas ${periodLabel}`} value={kpis?.totalSalesLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title={`Pagos ${periodLabel}`} value={kpis?.totalPaymentsLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Neto (Ventas - Pagos)" value={(kpis?.totalSalesLast30Days || 0) - (kpis?.totalPaymentsLast30Days || 0)} currency />
        </Grid>
      </Grid>

      {/* Rankings */}
      <Paper sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Ranking de Vendedores
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
    </Box>
  );
};

export default Dashboard;