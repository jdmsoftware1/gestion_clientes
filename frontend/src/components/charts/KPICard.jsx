import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  trend = null, 
  trendValue = null,
  color = 'primary',
  icon = null,
  subtitle = null 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp sx={{ fontSize: 16 }} />;
    if (trend === 'down') return <TrendingDown sx={{ fontSize: 16 }} />;
    return <TrendingFlat sx={{ fontSize: 16 }} />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'success';
    if (trend === 'down') return 'error';
    return 'default';
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (unit === '%') return val.toFixed(1);
      if (unit === '€') return val.toFixed(2);
      if (unit === 'días') return val.toFixed(1);
      return val.toFixed(0);
    }
    return val;
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && (
            <Box sx={{ mr: 1, color: `${color}.main` }}>
              {icon}
            </Box>
          )}
          <Typography color="textSecondary" variant="subtitle2" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {trend && trendValue && (
            <Chip
              icon={getTrendIcon()}
              label={`${trendValue > 0 ? '+' : ''}${trendValue}${unit}`}
              size="small"
              color={getTrendColor()}
              variant="outlined"
              sx={{ fontSize: '0.75rem' }}
            />
          )}
        </Box>
        
        <Typography variant="h4" component="div" color={`${color}.main`} sx={{ fontWeight: 'bold' }}>
          {unit === '€' && '€'}{formatValue(value)}{unit !== '€' && unit}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;
