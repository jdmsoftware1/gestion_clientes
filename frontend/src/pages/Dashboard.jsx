import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { dashboardAPI } from '../api/services';
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

  useEffect(() => {
    if (selectedSalesperson) {
      fetchDashboardData();
    }
  }, [selectedSalesperson]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedSalesperson?.id !== 'TODOS' ? { salespersonId: selectedSalesperson.id } : {};
      
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Deuda Total" value={kpis?.totalDebt} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Ventas Últimos 30 días" value={kpis?.totalSalesLast30Days} currency />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard title="Pagos Últimos 30 días" value={kpis?.totalPaymentsLast30Days} currency />
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
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Clientes Morosos (Top 10)
        </Typography>
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
              {delinquent.map((item, idx) => (
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
        <Typography variant="h6" sx={{ p: 2, fontWeight: 'bold' }}>
          Clientes para Vender (Deuda &lt; 75€)
        </Typography>
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
              {opportunities.map((item, idx) => (
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
    </Box>
  );
};

export default Dashboard;