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
  getAll: (params) => axiosInstance.get('/clients', { params }),
  getById: (id) => axiosInstance.get(`/clients/${id}`),
  create: (data) => axiosInstance.post('/clients', data),
  update: (id, data) => axiosInstance.put(`/clients/${id}`, data),
  delete: (id) => axiosInstance.delete(`/clients/${id}`),
};

// Sales API
export const salesAPI = {
  getAll: (params) => axiosInstance.get('/sales', { params }),
  getById: (id) => axiosInstance.get(`/sales/${id}`),
  create: (data) => axiosInstance.post('/sales', data),
  update: (id, data) => axiosInstance.put(`/sales/${id}`, data),
  delete: (id) => axiosInstance.delete(`/sales/${id}`),
  getByClient: (clientId) => axiosInstance.get(`/sales/client/${clientId}`),
};

// Payments API
export const paymentsAPI = {
  getAll: (params) => axiosInstance.get('/payments', { params }),
  getById: (id) => axiosInstance.get(`/payments/${id}`),
  create: (data) => axiosInstance.post('/payments', data),
  update: (id, data) => axiosInstance.put(`/payments/${id}`, data),
  delete: (id) => axiosInstance.delete(`/payments/${id}`),
  getByClient: (clientId) => axiosInstance.get(`/payments/client/${clientId}`),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: (params) => axiosInstance.get('/dashboard/kpis', { params }),
  getSalespersonRankings: (params) => axiosInstance.get('/dashboard/rankings', { params }),
  getDelinquentClients: (params) => axiosInstance.get('/dashboard/delinquent', { params }),
  getSalesOpportunities: (params) => axiosInstance.get('/dashboard/opportunities', { params }),
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

// Month Closures API
export const monthClosuresAPI = {
  getAll: (params) => axiosInstance.get('/month-closures', { params }),
  getById: (id) => axiosInstance.get(`/month-closures/${id}`),
  create: (data) => axiosInstance.post('/month-closures', data),
  update: (id, data) => axiosInstance.put(`/month-closures/${id}`, data),
  delete: (id) => axiosInstance.delete(`/month-closures/${id}`),
};