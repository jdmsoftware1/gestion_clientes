// Test controller - No necesita importaciones de modelos ni BD
// Usa solo datos simulados

// ============================================================================
// 🧪 TEST ANALYTICS CONTROLLER - VERSIONES SIMPLIFICADAS PARA PRUEBAS
// ============================================================================

// Test KPIs básicos
export const testGetAdvancedKPIs = async (req, res) => {
  try {
    console.log('🧪 Testing Advanced KPIs...');
    
    // Datos simulados para pruebas rápidas
    const mockData = {
      conversionRate: {
        clients_with_payments: 150,
        total_clients: 300,
        conversion_rate: 50.0
      },
      avgCollectionTime: {
        avg_collection_days: 45.5
      },
      salesEfficiency: [
        { salesperson_name: 'Bego', total_sales: 85, active_days: 30, sales_per_day: 2.83 },
        { salesperson_name: 'David', total_sales: 72, active_days: 28, sales_per_day: 2.57 },
        { salesperson_name: 'Yaiza', total_sales: 68, active_days: 25, sales_per_day: 2.72 }
      ],
      debtDistribution: [
        { debt_range: '0-100€', client_count: 50, total_debt: 3500 },
        { debt_range: '101-500€', client_count: 120, total_debt: 35000 },
        { debt_range: '501-1000€', client_count: 80, total_debt: 60000 },
        { debt_range: '1001-2000€', client_count: 40, total_debt: 55000 },
        { debt_range: '2000€+', client_count: 10, total_debt: 25000 }
      ]
    };

    console.log('✅ KPIs test data generated successfully');
    res.json(mockData);
    
  } catch (error) {
    console.error('❌ Error in testGetAdvancedKPIs:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test tendencias temporales
export const testGetTrendData = async (req, res) => {
  try {
    console.log('🧪 Testing Trend Data...');
    const { period = 'daily' } = req.query;
    
    // Generar datos de tendencia simulados
    const generateTrendData = (days = 30) => {
      const data = [];
      const today = new Date();
      
      for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const periodLabel = date.toISOString().split('T')[0];
        const salesAmount = Math.random() * 5000 + 1000; // 1000-6000€
        const paymentsAmount = Math.random() * 3000 + 500; // 500-3500€
        
        data.push({
          period: date.toISOString(),
          period_label: periodLabel,
          sales_amount: Math.round(salesAmount * 100) / 100,
          payments_amount: Math.round(paymentsAmount * 100) / 100
        });
      }
      return data;
    };

    const mockData = {
      salesTrend: generateTrendData(30),
      paymentsTrend: generateTrendData(30)
    };

    console.log('✅ Trend data test generated successfully');
    res.json(mockData);
    
  } catch (error) {
    console.error('❌ Error in testGetTrendData:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test comparación vendedores
export const testGetSalespersonComparison = async (req, res) => {
  try {
    console.log('🧪 Testing Salesperson Comparison...');
    
    const mockData = [
      {
        salesperson_name: 'Bego',
        sales_amount: 45000,
        payments_amount: 32000,
        pending_debt: 13000,
        client_count: 85
      },
      {
        salesperson_name: 'David',
        sales_amount: 38000,
        payments_amount: 28000,
        pending_debt: 10000,
        client_count: 72
      },
      {
        salesperson_name: 'Yaiza',
        sales_amount: 42000,
        payments_amount: 35000,
        pending_debt: 7000,
        client_count: 68
      },
      {
        salesperson_name: 'BegoJi',
        sales_amount: 35000,
        payments_amount: 25000,
        pending_debt: 10000,
        client_count: 55
      }
    ];

    console.log('✅ Comparison data test generated successfully');
    res.json(mockData);
    
  } catch (error) {
    console.error('❌ Error in testGetSalespersonComparison:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test alertas
export const testGetBusinessAlerts = async (req, res) => {
  try {
    console.log('🧪 Testing Business Alerts...');
    
    const alerts = [
      {
        id: 'test_old_debt',
        type: 'critical',
        title: '15 clientes con deuda antigua',
        description: 'Clientes sin actividad por más de 90 días',
        priority: 'high',
        icon: 'warning',
        action: 'Revisar y contactar urgentemente',
        createdAt: new Date().toISOString(),
        data: [
          {
            client_name: 'Cliente Test 1',
            phone: '123456789',
            salesperson_name: 'Bego',
            debt_amount: 1500,
            days_since_last_activity: 120
          },
          {
            client_name: 'Cliente Test 2',
            phone: '987654321',
            salesperson_name: 'David',
            debt_amount: 2300,
            days_since_last_activity: 95
          }
        ]
      },
      {
        id: 'test_opportunities',
        type: 'info',
        title: '8 oportunidades de cobro',
        description: 'Clientes con deuda media (€200-1000) y actividad reciente',
        priority: 'medium',
        icon: 'monetization_on',
        action: 'Contactar para negociar pago',
        createdAt: new Date().toISOString(),
        data: [
          {
            client_name: 'Oportunidad Test 1',
            phone: '555123456',
            salesperson_name: 'Yaiza',
            debt_amount: 750,
            days_since_last_activity: 45
          }
        ]
      }
    ];

    const summary = {
      total: alerts.length,
      critical: alerts.filter(a => a.type === 'critical').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length,
      success: alerts.filter(a => a.type === 'success').length
    };

    console.log('✅ Alerts test data generated successfully');
    res.json({ alerts, summary });
    
  } catch (error) {
    console.error('❌ Error in testGetBusinessAlerts:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test análisis predictivo
export const testGetSalesPrediction = async (req, res) => {
  try {
    console.log('🧪 Testing Sales Prediction...');
    const { months = 3 } = req.query;
    
    // Datos históricos simulados
    const historicalData = [];
    const predictions = [];
    
    // Generar 12 meses de datos históricos
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const periodLabel = date.toISOString().slice(0, 7);
      
      historicalData.push({
        period: date.toISOString(),
        period_label: periodLabel,
        sales_count: Math.floor(Math.random() * 50) + 20,
        sales_amount: Math.random() * 15000 + 5000
      });
    }
    
    // Generar predicciones futuras
    for (let i = 1; i <= parseInt(months); i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const periodLabel = date.toISOString().slice(0, 7);
      
      predictions.push({
        period: date.toISOString(),
        period_label: periodLabel,
        predicted_sales_amount: Math.random() * 12000 + 8000,
        predicted_sales_count: Math.floor(Math.random() * 40) + 25,
        confidence: Math.max(70 - (i * 10), 40)
      });
    }

    const mockData = {
      historicalData,
      predictions,
      summary: {
        avgMonthlySales: 10500,
        avgMonthlyCount: 35,
        trend: 5.2,
        trendDirection: 'up'
      }
    };

    console.log('✅ Prediction test data generated successfully');
    res.json(mockData);
    
  } catch (error) {
    console.error('❌ Error in testGetSalesPrediction:', error);
    res.status(500).json({ error: error.message });
  }
};

export default {
  testGetAdvancedKPIs,
  testGetTrendData,
  testGetSalespersonComparison,
  testGetBusinessAlerts,
  testGetSalesPrediction
};
