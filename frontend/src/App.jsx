import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SalespersonProvider } from './context/SalespersonContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Salespeople from './pages/Salespeople';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import Payments from './pages/Payments';
import Import from './pages/Import';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import TestAnalytics from './pages/TestAnalytics';
import TestAlerts from './pages/TestAlerts';

function App() {
  return (
    <SalespersonProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/salespeople" element={<Salespeople />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/import" element={<Import />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/test-analytics" element={<TestAnalytics />} />
            <Route path="/test-alerts" element={<TestAlerts />} />
          </Routes>
        </Layout>
      </Router>
    </SalespersonProvider>
  );
}

export default App;