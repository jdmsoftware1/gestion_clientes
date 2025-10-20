import React from 'react';
import { Box, Typography } from '@mui/material';
import HistoricalAnalytics from '../components/HistoricalAnalytics';

const HistoricalAnalyticsPage = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#2E7D32' }}>
        📊 Analytics Históricos
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
        Análisis completo de datos históricos anteriores a octubre 2025
      </Typography>
      
      <HistoricalAnalytics />
    </Box>
  );
};

export default HistoricalAnalyticsPage;
