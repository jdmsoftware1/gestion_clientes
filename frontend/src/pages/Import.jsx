import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { importAPI } from '../api/services';

const Import = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setError('El archivo debe ser un CSV');
      return;
    }

    try {
      setLoading(true);
      const response = await importAPI.importClientsFromCSV(file);
      setResult(response.data);
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Importar Clientes desde CSV
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Formato del CSV
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            El archivo debe contener las siguientes columnas:
          </Typography>
          <ul>
            <li>
              <strong>nombre_cliente</strong>
            </li>
            <li>
              <strong>telefono_cliente</strong>
            </li>
            <li>
              <strong>email_cliente</strong>
            </li>
            <li>
              <strong>nombre_vendedor</strong>
            </li>
            <li>
              <strong>deuda_inicial</strong>
            </li>
          </ul>
          <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
            Ejemplo: Juan Pérez,123456789,juan@example.com,Carlos,500
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!result ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ flex: 1 }}
            />
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleUpload}
              disabled={loading || !file}
            >
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </Box>
          {file && (
            <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
              Archivo seleccionado: {file.name}
            </Typography>
          )}
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Importación completada!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Clientes importados: <strong>{result.imported}</strong>
            {result.failed > 0 && ` | Errores: ${result.failed}`}
          </Typography>

          {result.results && result.results.length > 0 && (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Vendedor</TableCell>
                    <TableCell align="right">Deuda Inicial</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.results.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell>{item.salespersonName}</TableCell>
                      <TableCell align="right">€ {item.initialDebt.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {result.errors && result.errors.length > 0 && (
            <Alert severity="warning">
              Se encontraron {result.errors.length} errores durante la importación
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={() => setResult(null)}
            sx={{ mt: 2 }}
          >
            Importar otro archivo
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Import;