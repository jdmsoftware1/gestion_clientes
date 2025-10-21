import axios from 'axios';

async function testDashboard() {
  try {
    console.log('🧪 Testing dashboard KPIs...');
    const response = await axios.get('http://localhost:5000/api/dashboard/kpis?salespersonId=579588ae-1fd0-4d7d-8227-8c89490d72c9&dateFrom=2025-09-21&dateTo=2025-10-21');
    console.log('✅ Dashboard KPIs working:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDashboard();
