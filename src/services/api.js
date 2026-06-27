import axios from 'axios';

const API_URL = 'https://rizq-backend-1.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== ADMIN =====
export const getStats = () => api.get('/admin/stats');
export const getTodayStats = () => api.get('/admin/stats/today');
export const getAllUsers = (role) => api.get(`/admin/users${role ? `?role=${role}` : ''}`);
export const getAllSellers = () => api.get('/admin/sellers');
export const getAllProducts = () => api.get('/admin/products');
export const getAllOrders = (status) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`);
export const blockUser = (userId) => api.post(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.post(`/admin/users/${userId}/unblock`);
export const verifyCourier = (userId) => api.post(`/admin/couriers/${userId}/verify`);

export default api;