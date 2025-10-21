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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { clientsAPI, salespeopleAPI, salesAPI, paymentsAPI } from '../api/services';
import { useSalesperson } from '../context/SalespersonContext';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [salespeople, setSalespeople] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openSaleDialog, setOpenSaleDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [saleFormData, setSaleFormData] = useState({
    amount: '',
    description: '',
  });
  const [paymentFormData, setPaymentFormData] = useState({
    amount: '',
    paymentMethod: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    internalCode: '',
    phone: '',
    address: '',
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

  const handleRowClick = (client) => {
    setSelectedClient(client);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedClient(null);
  };

  const handleOpenSaleDialog = (client) => {
    setSelectedClient(client);
    setSaleFormData({
      amount: '',
      description: '',
    });
    setOpenSaleDialog(true);
  };

  const handleCloseSaleDialog = () => {
    setOpenSaleDialog(false);
    setSaleFormData({
      amount: '',
      description: '',
    });
  };

  const handleOpenPaymentDialog = (client) => {
    setSelectedClient(client);
    setPaymentFormData({
      amount: '',
      paymentMethod: '',
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setPaymentFormData({
      amount: '',
      paymentMethod: '',
    });
  };

  const handleCreateSale = async () => {
    if (!saleFormData.amount || !saleFormData.description) {
      setError('Monto y descripción son requeridos');
      return;
    }

    try {
      const data = {
        ...saleFormData,
        amount: parseFloat(saleFormData.amount),
        clientId: selectedClient.id,
      };

      await salesAPI.create(data);
      fetchClients(); // Para actualizar la deuda del cliente
      handleCloseSaleDialog();
      handleCloseDetailDialog();
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentFormData.amount || !paymentFormData.paymentMethod) {
      setError('Monto y método de pago son requeridos');
      return;
    }

    try {
      const data = {
        ...paymentFormData,
        amount: parseFloat(paymentFormData.amount),
        clientId: selectedClient.id,
      };

      await paymentsAPI.create(data);
      fetchClients(); // Para actualizar la deuda del cliente
      handleClosePaymentDialog();
      handleCloseDetailDialog();
      setError(null);
    } catch (err) {
      setError(err.message);
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
                    <TableRow 
                      key={item.id} 
                      sx={{
                        ...item.debt < 50 ? { backgroundColor: '#e8f5e9' } : {},
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: item.debt < 50 ? '#c8e6c9' : '#f5f5f5',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }
                      }}
                      onClick={() => handleRowClick(item)}
                    >
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
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(item);
                            }}
                            color="info"
                            title="Ver Detalles"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(item);
                            }}
                            color="primary"
                            title="Editar"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            color="error"
                            title="Eliminar"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
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

      {/* Modal de Detalles del Cliente */}
      <Dialog 
        open={openDetailDialog} 
        onClose={handleCloseDetailDialog} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              📋 Detalles del Cliente
            </Typography>
            {selectedClient && (
              <Chip 
                label={selectedClient.internalCode || 'Sin código'} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedClient && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Información Principal */}
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                  Información Principal
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Nombre</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Código Interno</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.internalCode || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Teléfono</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.phone || 'No especificado'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Dirección</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.address || 'No especificada'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Información Financiera */}
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 'bold' }}>
                  💰 Información Financiera
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Deuda Actual</Typography>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: selectedClient.debt > 0 ? '#d32f2f' : '#2E7D32'
                      }}
                    >
                      € {selectedClient.debt?.toFixed(2) || '0.00'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Último Pago</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.lastPaymentMonth || 'Sin pagos registrados'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Estado</Typography>
                    <Chip 
                      label={
                        selectedClient.debt === 0 ? 'Sin deuda' :
                        selectedClient.debt < 50 ? 'Oportunidad' :
                        'Con deuda'
                      }
                      color={
                        selectedClient.debt === 0 ? 'success' :
                        selectedClient.debt < 50 ? 'warning' :
                        'error'
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Total de Ventas</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.totalSales ? Math.round(selectedClient.totalSales) : 0} operaciones
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Información de Fechas */}
              <Paper sx={{ p: 2, backgroundColor: '#f9f9f9' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#ff9800', fontWeight: 'bold' }}>
                  📅 Información de Fechas
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Fecha de Creación</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.createdAt ? new Date(selectedClient.createdAt).toLocaleDateString() : 'No disponible'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">Última Actualización</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedClient.updatedAt ? new Date(selectedClient.updatedAt).toLocaleDateString() : 'No disponible'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f5f5f5', pt: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              onClick={() => handleOpenSaleDialog(selectedClient)}
              variant="contained" 
              color="success"
              startIcon={<ShoppingCartIcon />}
            >
              Registrar Venta
            </Button>
            <Button 
              onClick={() => handleOpenPaymentDialog(selectedClient)}
              variant="contained" 
              color="info"
              startIcon={<PaymentIcon />}
            >
              Registrar Pago
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCloseDetailDialog} variant="outlined">
              Cerrar
            </Button>
            <Button 
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenDialog(selectedClient);
              }} 
              variant="contained" 
              color="primary"
              startIcon={<EditIcon />}
            >
              Editar Cliente
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Modal de Registrar Venta */}
      <Dialog open={openSaleDialog} onClose={handleCloseSaleDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#e8f5e9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCartIcon sx={{ color: '#2E7D32' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              Registrar Nueva Venta
            </Typography>
          </Box>
          {selectedClient && (
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              Cliente: {selectedClient.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Monto de la Venta *"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={saleFormData.amount}
              onChange={(e) => setSaleFormData({ ...saleFormData, amount: e.target.value })}
              placeholder="Ej: 500.00"
              required
              autoFocus
              size="small"
            />
            <TextField
              fullWidth
              label="Descripción de la Venta *"
              multiline
              rows={3}
              value={saleFormData.description}
              onChange={(e) => setSaleFormData({ ...saleFormData, description: e.target.value })}
              placeholder="Ej: Venta de productos electrónicos"
              required
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f9f9f9', pt: 2 }}>
          <Button onClick={handleCloseSaleDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateSale} 
            variant="contained" 
            color="success"
            startIcon={<ShoppingCartIcon />}
            disabled={!saleFormData.amount || !saleFormData.description}
          >
            Registrar Venta
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Registrar Pago */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#e3f2fd' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PaymentIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Registrar Nuevo Pago
            </Typography>
          </Box>
          {selectedClient && (
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              Cliente: {selectedClient.name} | Deuda actual: € {selectedClient.debt?.toFixed(2) || '0.00'}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Monto del Pago *"
              type="number"
              inputProps={{ step: '0.01', min: '0' }}
              value={paymentFormData.amount}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
              placeholder="Ej: 200.00"
              required
              autoFocus
              size="small"
              helperText={`Deuda actual del cliente: € ${selectedClient?.debt?.toFixed(2) || '0.00'}`}
            />
            <TextField
              fullWidth
              label="Método de Pago *"
              value={paymentFormData.paymentMethod}
              onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
              placeholder="Ej: Efectivo, Transferencia, Tarjeta"
              required
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f9f9f9', pt: 2 }}>
          <Button onClick={handleClosePaymentDialog} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreatePayment} 
            variant="contained" 
            color="info"
            startIcon={<PaymentIcon />}
            disabled={!paymentFormData.amount || !paymentFormData.paymentMethod}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;