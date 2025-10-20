import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge
} from '@mui/material';
import {
  Notifications,
  Refresh,
  FilterList,
  Warning,
  TrendingDown,
  Info,
  CheckCircle
} from '@mui/icons-material';
import analyticsAPI from '../api/analyticsAPI';
import { useSalesperson } from '../context/SalespersonContext';
import AlertCard from '../components/alerts/AlertCard';
import KPICard from '../components/charts/KPICard';

const Alerts = () => {
  const { selectedSalesperson } = useSalesperson();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Cargar alertas
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {};
      const response = await analyticsAPI.getBusinessAlerts(params);
      
      setAlerts(response.data.alerts);
      setSummary(response.data.summary);
      
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSalesperson) {
      fetchAlerts();
    }
  }, [selectedSalesperson]);

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    const typeMatch = filterType === 'all' || alert.type === filterType;
    const priorityMatch = filterPriority === 'all' || alert.priority === filterPriority;
    return typeMatch && priorityMatch;
  });

  // Ordenar por prioridad
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  if (!selectedSalesperson) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Selecciona un vendedor para ver las alertas
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Badge badgeContent={summary.total || 0} color="error">
          <Notifications />
        </Badge>
        Sistema de Alertas Inteligentes
      </Typography>

      {/* Resumen de alertas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Alertas Críticas"
            value={summary.critical || 0}
            icon={<Warning />}
            color="error"
            subtitle="Requieren atención inmediata"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Advertencias"
            value={summary.warning || 0}
            icon={<TrendingDown />}
            color="warning"
            subtitle="Situaciones a monitorear"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Información"
            value={summary.info || 0}
            icon={<Info />}
            color="info"
            subtitle="Datos relevantes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Oportunidades"
            value={summary.success || 0}
            icon={<CheckCircle />}
            color="success"
            subtitle="Acciones recomendadas"
          />
        </Grid>
      </Grid>

      {/* Controles */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList />
              Filtros
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: '120px' }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filterType}
                label="Tipo"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="critical">Críticas</MenuItem>
                <MenuItem value="warning">Advertencias</MenuItem>
                <MenuItem value="info">Información</MenuItem>
                <MenuItem value="success">Oportunidades</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: '120px' }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={filterPriority}
                label="Prioridad"
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="high">Alta</MenuItem>
                <MenuItem value="medium">Media</MenuItem>
                <MenuItem value="low">Baja</MenuItem>
              </Select>
            </FormControl>

            <Chip 
              label={`${sortedAlerts.length} alertas`} 
              color="primary" 
              variant="outlined" 
            />
          </Stack>

          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={fetchAlerts}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de alertas */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && sortedAlerts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            ¡No hay alertas activas!
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {filterType !== 'all' || filterPriority !== 'all' 
              ? 'No se encontraron alertas con los filtros aplicados.'
              : 'Todo está funcionando correctamente en este momento.'
            }
          </Typography>
        </Paper>
      )}

      {!loading && sortedAlerts.length > 0 && (
        <Box>
          {sortedAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Alerts;
