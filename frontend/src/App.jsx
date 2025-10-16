import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Salespeople from './pages/Salespeople';
import Clients from './pages/Clients';
import Sales from './pages/Sales';
import Payments from './pages/Payments';
import Import from './pages/Import';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/salespeople" element={<Salespeople />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/import" element={<Import />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;