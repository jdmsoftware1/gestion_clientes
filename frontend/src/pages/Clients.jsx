import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
  Typography,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { clientsAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
  });

  const { selectedSalesperson, changeSalesperson } = useSalesperson();

  useEffect(() => {
    if (selectedSalesperson) {
      fetchClients();
    }
  }, [selectedSalesperson]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await clientsAPI.getAll({ salespersonId: selectedSalesperson.id });
      setClients(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingId(client.id);
      setFormData({
        name: client.name,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      name: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        salespersonId: selectedSalesperson.id,
      };

      if (editingId) {
        await clientsAPI.update(editingId, dataToSubmit);
      } else {
        await clientsAPI.create(dataToSubmit);
      }
      fetchClients();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await clientsAPI.delete(id);
        fetchClients();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Clientes</Typography>
          {selectedSalesperson && (
            <Typography variant="body2" sx={{ color: '#2E7D32', fontWeight: 500 }}>
              Vendedor: {selectedSalesperson.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Deuda</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Última Pago</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Eliminar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((item) => (
                <TableRow key={item.id} sx={item.debt < 50 ? { backgroundColor: '#e8f5e9' } : {}}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">
                    <span style={{ fontSize: '1.1em', fontWeight: 'bold', color: item.debt > 0 ? '#d32f2f' : '#2E7D32' }}>
                      € {item.debt?.toFixed(2) || '0.00'}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={item.lastPaymentMonth || '-'} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.85em' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDelete(item.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: '300px' }}>
          <TextField
            fullWidth
            label="Nombre del Cliente *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Juan García"
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;