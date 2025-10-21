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
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { returnsAPI, clientsAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const Returns = () => {
  const { selectedSalesperson } = useSalesperson();
  const [returns, setReturns] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    returnReason: '',
    clientId: '',
  });

  useEffect(() => {
    if (selectedSalesperson) {
      fetchReturns();
      fetchClients();
    }
  }, [selectedSalesperson]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await returnsAPI.getAll({ salespersonId: selectedSalesperson.id });
      setReturns(response.data);
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

  const handleOpenDialog = (returnItem = null) => {
    if (returnItem) {
      setEditingId(returnItem.id);
      setFormData({
        amount: returnItem.amount,
        description: returnItem.description,
        returnReason: returnItem.returnReason,
        clientId: returnItem.clientId,
      });
    } else {
      setEditingId(null);
      setFormData({
        amount: '',
        description: '',
        returnReason: '',
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
      returnReason: '',
      clientId: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.amount || !formData.description || !formData.clientId) {
      setError('Monto, descripción y cliente son requeridos');
      return;
    }

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      if (editingId) {
        await returnsAPI.update(editingId, data);
      } else {
        await returnsAPI.create(data);
      }
      fetchReturns();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro?')) {
      try {
        await returnsAPI.delete(id);
        fetchReturns();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4">Devoluciones</Typography>
          {selectedSalesperson && (
            <Typography variant="body2" sx={{ color: '#ff9800', fontWeight: 500 }}>
              Vendedor: {selectedSalesperson.name}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
        >
          Nueva Devolución
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {returns.map((item) => (
                <TableRow key={item.id} sx={{ backgroundColor: '#fff8e1' }}>
                  <TableCell>{item.client?.name || '-'}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.returnReason || 'No especificado'}</TableCell>
                  <TableCell align="right" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                    € {parseFloat(item.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                      <UndoIcon sx={{ color: '#ff9800' }} />
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
        <DialogTitle sx={{ backgroundColor: '#fff3e0' }}>
          {editingId ? 'Editar Devolución' : 'Nueva Devolución'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, minWidth: '400px' }}>
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
            label="Monto de la Devolución *"
            type="number"
            inputProps={{ step: '0.01' }}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Descripción de la Devolución *"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Motivo de la Devolución"
            value={formData.returnReason}
            onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
            placeholder="Ej: Producto defectuoso, cambio de talla"
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f9f9f9' }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            {editingId ? 'Actualizar' : 'Registrar'} Devolución
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Returns;
