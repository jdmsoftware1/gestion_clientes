import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  Assessment,
  BugReport,
  CheckCircle,
  Error,
  Refresh
} from '@mui/icons-material';
import axios from 'axios';

// Configuración de la API de pruebas
const testAPI = axios.create({
  baseURL: 'http://localhost:5000/api/analytics'
});

const TestAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  // Tests disponibles
  const tests = [
    { id: 'kpis', name: 'KPIs Avanzados', endpoint: '/test/kpis' },
    { id: 'trends', name: 'Tendencias', endpoint: '/test/trends' },
    { id: 'comparison', name: 'Comparación', endpoint: '/test/comparison' },
    { id: 'alerts', name: 'Alertas', endpoint: '/test/alerts' },
    { id: 'prediction', name: 'Predicción', endpoint: '/test/prediction' }
  ];

  // Ejecutar un test específico
  const runTest = async (test) => {
    try {
      setLoading(true);
      console.log(`🧪 Running test: ${test.name}`);
      
      const response = await testAPI.get(test.endpoint);
      
      setResults(prev => ({
        ...prev,
        [test.id]: {
          success: true,
          data: response.data,
          timestamp: new Date().toISOString()
        }
      }));
      
      setErrors(prev => ({ ...prev, [test.id]: null }));
      console.log(`✅ Test ${test.name} passed`);
      
    } catch (error) {
      console.error(`❌ Test ${test.name} failed:`, error);
      setErrors(prev => ({
        ...prev,
        [test.id]: error.response?.data?.error || error.message
      }));
      setResults(prev => ({ ...prev, [test.id]: null }));
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar todos los tests
  const runAllTests = async () => {
    setLoading(true);
    console.log('🧪 Running all analytics tests...');
    
    for (const test of tests) {
      await runTest(test);
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('🎉 All tests completed');
  };

  // Verificar estado de la API
  const checkAPIStatus = async () => {
    try {
      const response = await testAPI.get('/test/status');
      console.log('✅ API Status:', response.data);
      alert('✅ API Status: ' + response.data.message);
      return response.data;
    } catch (error) {
      console.error('❌ API Status check failed:', error);
      alert('❌ API Status check failed: ' + error.message);
      throw error;
    }
  };

  // Renderizar resultado de un test
  const renderTestResult = (test) => {
    const result = results[test.id];
    const error = errors[test.id];
    
    return (
      <Card key={test.id} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BugReport />
              {test.name}
            </Typography>
            <Stack direction="row" spacing={1}>
              {result && (
                <Chip 
                  icon={<CheckCircle />} 
                  label="PASSED" 
                  color="success" 
                  size="small"
                />
              )}
              {error && (
                <Chip 
                  icon={<Error />} 
                  label="FAILED" 
                  color="error" 
                  size="small"
                />
              )}
              <Button 
                size="small" 
                onClick={() => runTest(test)}
                disabled={loading}
              >
                Ejecutar
              </Button>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {result && (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                <strong>✅ Test exitoso</strong> - {new Date(result.timestamp).toLocaleString()}
              </Alert>
              
              <Typography variant="subtitle2" gutterBottom>
                Datos recibidos:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', maxHeight: '200px', overflow: 'auto' }}>
                <pre style={{ fontSize: '12px', margin: 0 }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}

          {!result && !error && (
            <Typography color="textSecondary">
              Haz clic en "Ejecutar" para probar este endpoint
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Assessment />
        🧪 Test Analytics - Entorno de Pruebas
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Entorno de Pruebas Separado</strong><br/>
        Este entorno usa datos simulados para probar todas las funcionalidades de analytics 
        sin afectar tu dashboard principal. Todos los endpoints devuelven datos de prueba.
      </Alert>

      {/* Controles principales */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
            onClick={runAllTests}
            disabled={loading}
            size="large"
          >
            {loading ? 'Ejecutando Tests...' : 'Ejecutar Todos los Tests'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={checkAPIStatus}
          >
            Verificar API Status
          </Button>

          <Typography variant="body2" color="textSecondary">
            {Object.keys(results).length} de {tests.length} tests completados
          </Typography>
        </Stack>
      </Paper>

      {/* Lista de todos los tests */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {tests.map(test => renderTestResult(test))}
        </Grid>
      </Grid>

      {/* Resumen */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Resumen de Resultados
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Typography variant="h4">
                  {Object.values(results).filter(r => r?.success).length}
                </Typography>
                <Typography>Tests Exitosos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
              <CardContent>
                <Typography variant="h4">
                  {Object.keys(errors).filter(k => errors[k]).length}
                </Typography>
                <Typography>Tests Fallidos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Typography variant="h4">
                  {tests.length}
                </Typography>
                <Typography>Total Tests</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default TestAnalytics;
