import axios from 'axios';
import fs from 'fs';

async function testOriginalEndpoint() {
  try {
    console.log('🧪 Testing original dashboard KPIs endpoint...');
    const response = await axios.get('http://localhost:5000/api/dashboard/kpis?salespersonId=579588ae-1fd0-4d7d-8227-8c89490d72c9&dateFrom=2025-09-21&dateTo=2025-10-21');
    console.log('✅ Success:', response.status);

    const result = {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
      url: 'http://localhost:5000/api/dashboard/kpis?salespersonId=579588ae-1fd0-4d7d-8227-8c89490d72c9&dateFrom=2025-09-21&dateTo=2025-10-21'
    };

    fs.writeFileSync('test_original_result.json', JSON.stringify(result, null, 2));
    console.log('📄 Result saved to test_original_result.json');

    console.log('📊 Data keys:', Object.keys(response.data));
    console.log('💰 Total Debt:', response.data.totalDebt);
    console.log('💸 Total Sales:', response.data.totalSalesLast30Days);
    console.log('💳 Total Payments:', response.data.totalPaymentsLast30Days);
    console.log('🔄 Total Returns:', response.data.totalReturnsLast30Days);
    console.log('🏷️  Period Label:', response.data.periodLabel);
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);

    const errorResult = {
      error: true,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString(),
      url: 'http://localhost:5000/api/dashboard/kpis?salespersonId=579588ae-1fd0-4d7d-8227-8c89490d72c9&dateFrom=2025-09-21&dateTo=2025-10-21'
    };

    fs.writeFileSync('test_original_error.json', JSON.stringify(errorResult, null, 2));
    console.log('📄 Error saved to test_original_error.json');
  }
}

testOriginalEndpoint();
