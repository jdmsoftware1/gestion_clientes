import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import {
  Notifications,
  Warning,
  Info,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

const testAPI = axios.create({
  baseURL: 'http://localhost:5000/api/analytics'
});

const TestAlerts = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState(null);

  const fetchTestAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🧪 Fetching test alerts...');
      
      const response = await testAPI.get('/test/alerts');
      
      setAlerts(response.data.alerts);
      setSummary(response.data.summary);
      console.log('✅ Test alerts loaded:', response.data);
      
    } catch (err) {
      console.error('❌ Error fetching test alerts:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestAlerts();
  }, []);

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <Warning />;
      case 'warning': return <Error />;
      case 'info': return <Info />;
      case 'success': return <CheckCircle />;
      default: return <Notifications />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Notifications />
        🧪 Test Alertas - Sistema de Pruebas
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Test del Sistema de Alertas</strong><br/>
        Esta página muestra alertas simuladas para probar el funcionamiento del sistema 
        sin usar datos reales de la base de datos.
      </Alert>

      {/* Controles */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Notifications />}
            onClick={fetchTestAlerts}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Recargar Alertas de Prueba'}
          </Button>
          
          <Typography variant="body2" color="textSecondary">
            {alerts.length} alertas de prueba disponibles
          </Typography>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Resumen de alertas */}
      {summary && Object.keys(summary).length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h4">{summary.total || 0}</Typography>
                <Typography>Total Alertas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h4">{summary.critical || 0}</Typography>
                <Typography>Críticas</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Typography variant="h4">{summary.warning || 0}</Typography>
                <Typography>Advertencias</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h4">{summary.info || 0}</Typography>
                <Typography>Información</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4">{summary.success || 0}</Typography>
                <Typography>Oportunidades</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Lista de alertas */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && alerts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No hay alertas de prueba disponibles
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Haz clic en "Recargar Alertas de Prueba" para generar datos de prueba.
          </Typography>
        </Paper>
      )}

      {!loading && alerts.length > 0 && (
        <Box>
          {alerts.map((alert) => (
            <Card 
              key={alert.id}
              sx={{ 
                mb: 2,
                border: `2px solid ${getPriorityColor(alert.priority)}`,
                borderLeft: `6px solid ${getPriorityColor(alert.priority)}`
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Box sx={{ color: getPriorityColor(alert.priority) }}>
                      {getAlertIcon(alert.type)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="div">
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {alert.description}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={alert.type.toUpperCase()} 
                      color={getAlertColor(alert.type)} 
                      size="small"
                      variant="outlined"
                    />
                    <Chip 
                      label={alert.priority.toUpperCase()} 
                      size="small"
                      sx={{ 
                        backgroundColor: getPriorityColor(alert.priority),
                        color: 'white'
                      }}
                    />
                  </Box>
                </Box>

                {alert.action && (
                  <Box sx={{ mb: 2 }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      color={getAlertColor(alert.type)}
                      startIcon={getAlertIcon(alert.type)}
                    >
                      {alert.action}
                    </Button>
                  </Box>
                )}

                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  Generado: {new Date(alert.createdAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TestAlerts;
