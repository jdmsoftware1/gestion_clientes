import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from '@mui/material';
import {
  Warning,
  TrendingDown,
  MonetizationOn,
  Star,
  TrackChanges,
  ExpandMore,
  ExpandLess,
  Phone,
  Person
} from '@mui/icons-material';

const AlertCard = ({ alert }) => {
  const [expanded, setExpanded] = useState(false);

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getAlertIcon = (iconName) => {
    switch (iconName) {
      case 'warning': return <Warning />;
      case 'trending_down': return <TrendingDown />;
      case 'monetization_on': return <MonetizationOn />;
      case 'star': return <Star />;
      case 'track_changes': return <TrackChanges />;
      default: return <Warning />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const formatCurrency = (amount) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  const formatDays = (days) => {
    return `${Math.floor(days)} días`;
  };

  const renderAlertData = () => {
    // Verificar si alert.data es un array válido
    if (!alert.data || !Array.isArray(alert.data) || alert.data.length === 0) {
      // Verificar si hay un mensaje directo en la alerta o en data
      const message = alert.message || alert.data?.message;
      if (message) {
        return (
          <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
            {message}
          </Typography>
        );
      }
      return null;
    }

    return (
      <List dense>
        {alert.data.slice(0, 5).map((item, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2">
                      {item.client_name || item.salesperson_name}
                    </Typography>
                    {item.debt_amount && (
                      <Chip 
                        label={formatCurrency(item.debt_amount)} 
                        size="small" 
                        color={parseFloat(item.debt_amount) > 1000 ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    {item.salesperson_name && item.client_name && (
                      <Typography variant="caption" display="block">
                        Vendedor: {item.salesperson_name}
                      </Typography>
                    )}
                    {item.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Phone fontSize="small" />
                        <Typography variant="caption">{item.phone}</Typography>
                      </Box>
                    )}
                    {item.days_since_last_activity && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        Sin actividad: {formatDays(item.days_since_last_activity)}
                      </Typography>
                    )}
                    {item.sales_amount !== undefined && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        Ventas: {formatCurrency(item.sales_amount)} | Pagos: {formatCurrency(item.payments_amount || 0)}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < Math.min(alert.data.length - 1, 4) && <Divider />}
          </React.Fragment>
        ))}
        {alert.data.length > 5 && (
          <ListItem>
            <ListItemText>
              <Typography variant="caption" color="textSecondary" align="center">
                ... y {alert.data.length - 5} más
              </Typography>
            </ListItemText>
          </ListItem>
        )}
      </List>
    );
  };

  return (
    <Card 
      sx={{ 
        mb: 2,
        border: `2px solid ${getPriorityColor(alert.priority)}`,
        borderLeft: `6px solid ${getPriorityColor(alert.priority)}`
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Box sx={{ color: getPriorityColor(alert.priority) }}>
              {getAlertIcon(alert.icon)}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div">
                {alert.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {alert.description}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={alert.type.toUpperCase()} 
              color={getAlertColor(alert.type)} 
              size="small"
              variant="outlined"
            />
            <Chip 
              label={alert.priority.toUpperCase()} 
              size="small"
              sx={{ 
                backgroundColor: getPriorityColor(alert.priority),
                color: 'white'
              }}
            />
            {alert.data && Array.isArray(alert.data) && alert.data.length > 0 && (
              <IconButton 
                onClick={() => setExpanded(!expanded)}
                size="small"
              >
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
        </Box>

        {alert.action && (
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small"
              color={getAlertColor(alert.type)}
              startIcon={getAlertIcon(alert.icon)}
            >
              {alert.action}
            </Button>
          </Box>
        )}

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="subtitle2" gutterBottom>
              Detalles:
            </Typography>
            {renderAlertData()}
          </Box>
        </Collapse>

        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {new Date(alert.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
