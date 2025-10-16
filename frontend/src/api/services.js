import axiosInstance from './axiosConfig';

// Salespeople API
export const salespeopleAPI = {
  getAll: () => axiosInstance.get('/salespeople'),
  getById: (id) => axiosInstance.get(`/salespeople/${id}`),
  create: (data) => axiosInstance.post('/salespeople', data),
  update: (id, data) => axiosInstance.put(`/salespeople/${id}`, data),
  delete: (id) => axiosInstance.delete(`/salespeople/${id}`),
};

// Clients API
export const clientsAPI = {
  getAll: () => axiosInstance.get('/clients'),
  getById: (id) => axiosInstance.get(`/clients/${id}`),
  create: (data) => axiosInstance.post('/clients', data),
  update: (id, data) => axiosInstance.put(`/clients/${id}`, data),
  delete: (id) => axiosInstance.delete(`/clients/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: () => axiosInstance.get('/sales'),
  getById: (id) => axiosInstance.get(`/sales/${id}`),
  create: (data) => axiosInstance.post('/sales', data),
  update: (id, data) => axiosInstance.put(`/sales/${id}`, data),
  delete: (id) => axiosInstance.delete(`/sales/${id}`),
  getByClient: (clientId) => axiosInstance.get(`/sales/client/${clientId}`),
};

// Payments API
export const paymentsAPI = {
  getAll: () => axiosInstance.get('/payments'),
  getById: (id) => axiosInstance.get(`/payments/${id}`),
  create: (data) => axiosInstance.post('/payments', data),
  update: (id, data) => axiosInstance.put(`/payments/${id}`, data),
  delete: (id) => axiosInstance.delete(`/payments/${id}`),
  getByClient: (clientId) => axiosInstance.get(`/payments/client/${clientId}`),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: () => axiosInstance.get('/dashboard/kpis'),
  getSalespersonRankings: () => axiosInstance.get('/dashboard/rankings'),
  getDelinquentClients: () => axiosInstance.get('/dashboard/delinquent'),
  getSalesOpportunities: () => axiosInstance.get('/dashboard/opportunities'),
};

// Import API
export const importAPI = {
  importClientsFromCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/import/clients-from-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};