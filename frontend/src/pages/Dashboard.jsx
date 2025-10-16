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
} from '@mui/material';
import { dashboardAPI } from '../api/services';

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
  const [kpis, setKpis] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [delinquent, setDelinquent] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisData, rankingsData, delinquentData, opportunitiesData] = await Promise.all([
        dashboardAPI.getKPIs(),
        dashboardAPI.getSalespersonRankings(),
        dashboardAPI.getDelinquentClients(),
        dashboardAPI.getSalesOpportunities(),
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
      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>

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
          Oportunidades de Venta (Deuda &lt; 50€)
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