import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { salesAPI, clientsAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const Sales = () => {
  const { selectedSalesperson } = useSalesperson();
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    clientId: '',
  });

  useEffect(() => {
    if (selectedSalesperson) {
      fetchSales();
      fetchClients();
    }
  }, [selectedSalesperson]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll({ salespersonId: selectedSalesperson.id });
      setSales(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ salespersonId: selectedSalesperson.id });
      setClients(response.data);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const handleOpenDialog = (sale = null) => {
    if (sale) {
      setEditingId(sale.id);
      setFormData({
        amount: sale.amount,
        description: sale.description,
        clientId: sale.clientId,
      });
    } else {
      setEditingId(null);
      setFormData({
        amount: '',
        description: '',
        clientId: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({
      amount: '',
      description: '',
      clientId: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.clientId) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (editingId) {
        await salesAPI.update(editingId, data);
      } else {
        await salesAPI.create(data);
      }
      fetchSales();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await salesAPI.delete(id);
        fetchSales();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Ventas</Typography>
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
          Nueva Venta
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Cliente</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.client?.name || '-'}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">€ {parseFloat(item.amount).toFixed(2)}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(item.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? 'Editar Venta' : 'Nueva Venta'}</DialogTitle>
        <DialogContent sx={{ pt: 2, minWidth: '400px' }}>
          <Autocomplete
            fullWidth
            sx={{ mb: 2 }}
            options={clients}
            getOptionLabel={(option) => 
              `${option.internalCode ? `[${option.internalCode}] ` : ''}${option.name}`
            }
            value={clients.find(c => c.id === formData.clientId) || null}
            onChange={(e, value) => setFormData({ ...formData, clientId: value?.id || '' })}
            renderInput={(params) => <TextField {...params} label="Cliente" />}
            filterOptions={(options, { inputValue }) => {
              return options.filter(option =>
                option.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                (option.internalCode && option.internalCode.toLowerCase().includes(inputValue.toLowerCase()))
              );
            }}
          />
          <TextField
            fullWidth
            label="Monto"
            type="number"
            inputProps={{ step: '0.01' }}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

export default Sales;