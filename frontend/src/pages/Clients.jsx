import React, { useEffect, useState, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { clientsAPI, salespeopleAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [salespeople, setSalespeople] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    salespersonId: '',
  });

  const { selectedSalesperson, changeSalesperson } = useSalesperson();

  // Filtrar clientes según búsqueda
  const filteredClients = useMemo(() => {
    if (!searchText.trim()) return clients;
    
    const searchLower = searchText.toLowerCase();
    return clients.filter(client =>
      client.name?.toLowerCase().includes(searchLower) ||
      client.internalCode?.toLowerCase().includes(searchLower) ||
      client.id?.toString().includes(searchLower)
    );
  }, [clients, searchText]);

  useEffect(() => {
    if (selectedSalesperson) {
      fetchClients();
    }
    fetchSalespeople();
  }, [selectedSalesperson]);

  const fetchSalespeople = async () => {
    try {
      const response = await salespeopleAPI.getAll();
      setSalespeople(response.data);
    } catch (err) {
      console.error('Error fetching salespeople:', err);
    }
  };

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
        internalCode: client.internalCode || '',
        salespersonId: client.salespersonId || selectedSalesperson.id,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        internalCode: '',
        salespersonId: selectedSalesperson.id,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      name: '',
      internalCode: '',
      salespersonId: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!formData.salespersonId) {
      setError('El vendedor es requerido');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
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
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Buscar por nombre, código interno o ID..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              fullWidth
              size="small"
              variant="outlined"
              sx={{ backgroundColor: '#fafafa' }}
            />
          </Box>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Deuda</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Última Pago</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#999' }}>
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((item) => (
                    <TableRow key={item.id} sx={item.debt < 50 ? { backgroundColor: '#e8f5e9' } : {}}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                          {item.internalCode || '-'}
                        </Typography>
                      </TableCell>
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
                          onClick={() => handleOpenDialog(item)}
                          color="primary"
                          title="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(item.id)}
                          color="error"
                          title="Eliminar"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Código Interno"
              value={formData.internalCode}
              onChange={(e) => setFormData({ ...formData, internalCode: e.target.value })}
              placeholder="Ej: CLI-001"
              helperText="Código por el que suele filtrar (opcional)"
              size="small"
            />
            <TextField
              fullWidth
              label="Nombre del Cliente *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Juan García"
              required
              autoFocus
              size="small"
            />
            <FormControl fullWidth size="small" required>
              <InputLabel>Vendedor *</InputLabel>
              <Select
                value={formData.salespersonId}
                onChange={(e) => setFormData({ ...formData, salespersonId: e.target.value })}
                label="Vendedor *"
              >
                {salespeople.map((salesperson) => (
                  <MenuItem key={salesperson.id} value={salesperson.id}>
                    {salesperson.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
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