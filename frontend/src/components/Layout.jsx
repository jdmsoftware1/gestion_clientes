import React from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  createTheme,
  ThemeProvider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSalesperson } from '../context/SalespersonContext';

// Tema verde personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Verde fuerte
      light: '#81C784', // Verde claro
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const DRAWER_WIDTH = 260;

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { salespeople, selectedSalesperson, changeSalesperson } = useSalesperson();

  const menuItems = [
    { label: 'Dashboard', icon: <HomeIcon />, path: '/' },
    { label: 'Vendedores', icon: <PeopleIcon />, path: '/salespeople' },
    { label: 'Clientes', icon: <PersonIcon />, path: '/clients' },
    { label: 'Ventas', icon: <ShoppingCartIcon />, path: '/sales' },
    { label: 'Pagos', icon: <PaymentIcon />, path: '/payments' },
    { label: 'Importar CSV', icon: <UploadFileIcon />, path: '/import' },
    { label: 'Análisis Avanzados', icon: <AssessmentIcon />, path: '/analytics' },
    { label: 'Analytics Históricos', icon: <HistoryIcon />, path: '/historical-analytics' },
    { label: 'Alertas', icon: <NotificationsIcon />, path: '/alerts' },
    { label: '🧪 Test Analytics', icon: <BugReportIcon />, path: '/test-analytics' },
    { label: '🧪 Test Alertas', icon: <BugReportIcon />, path: '/test-alerts' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#ffffff' }}>
        {/* DRAWER PERMANENTE */}
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              backgroundColor: '#2E7D32',
              color: '#ffffff',
              boxSizing: 'border-box',
              paddingTop: '20px',
            },
          }}
        >
          {/* Logo/Título */}
          <Box sx={{ px: 2, pb: 3, textAlign: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
              📊 Decoraciones Ángel E Hijas
            </span>
          </Box>

          {/* Menú */}
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: '8px',
                    backgroundColor: location.pathname === item.path ? '#81C784' : 'transparent',
                    color: location.pathname === item.path ? '#1B5E20' : '#ffffff',
                    '&:hover': {
                      backgroundColor: '#66BB6A',
                      color: '#ffffff',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? '#1B5E20' : '#ffffff',
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    sx={{ '& .MuiTypography-root': { fontWeight: '500' } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* CONTENIDO PRINCIPAL */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* AppBar */}
          <AppBar
            position="static"
            sx={{
              backgroundColor: '#81C784',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Toolbar>
              <Box sx={{ flexGrow: 1 }}>
                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#1B5E20' }}>
                  Gestión de Clientes y Ventas
                </span>
              </Box>
              
              {/* Selector de Vendedor */}
              {selectedSalesperson && (
                <FormControl sx={{ minWidth: 200, backgroundColor: '#ffffff', borderRadius: 1 }}>
                  <InputLabel sx={{ color: '#1B5E20' }}>Vendedor</InputLabel>
                  <Select
                    value={selectedSalesperson.id}
                    onChange={(e) => {
                      const selected = salespeople.find(s => s.id === e.target.value);
                      if (selected) changeSalesperson(selected);
                    }}
                    label="Vendedor"
                    sx={{
                      color: '#1B5E20',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1B5E20',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1B5E20',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1B5E20',
                      },
                    }}
                  >
                    {salespeople.map((sp) => (
                      <MenuItem key={sp.id} value={sp.id}>
                        {sp.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Toolbar>
          </AppBar>

          {/* Contenido */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 3,
              backgroundColor: '#ffffff',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;