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
export const getUserDetail = (userId) => api.get(`/admin/users/${userId}`);
export const getAllSellers = () => api.get('/admin/sellers');
export const getAllProducts = () => api.get('/admin/products');
export const getAllOrders = (status) => api.get(`/admin/orders${status ? `?status=${status}` : ''}`);
export const getOrderDetail = (orderId) => api.get(`/admin/orders/${orderId}`);
export const getAllBonuses = () => api.get('/admin/bonuses');
export const getAllPayouts = () => api.get('/admin/payouts');
export const getActivityLogs = (limit) => api.get(`/admin/logs?limit=${limit || 100}`);
export const getNotifications = () => api.get('/admin/notifications');

// ===== ACTIONS =====
export const blockUser = (userId) => api.post(`/admin/users/${userId}/block`);
export const unblockUser = (userId) => api.post(`/admin/users/${userId}/unblock`);
export const verifyCourier = (userId) => api.post(`/admin/couriers/${userId}/verify`);
export const resetPassword = (userId, newPassword) => api.post(`/admin/users/${userId}/reset-password?new_password=${newPassword}`);

// ===== EDIT =====
export const updateUser = (userId, data) => api.put(`/admin/users/${userId}?${new URLSearchParams(data).toString()}`);
export const updateSeller = (sellerId, data) => api.put(`/admin/sellers/${sellerId}?${new URLSearchParams(data).toString()}`);
export const updateProduct = (productId, data) => api.put(`/admin/products/${productId}?${new URLSearchParams(data).toString()}`);
export const deleteProduct = (productId) => api.delete(`/admin/products/${productId}`);
export const updateOrderStatus = (orderId, status) => api.put(`/admin/orders/${orderId}/status?status=${status}`);
export const cancelOrder = (orderId) => api.delete(`/admin/orders/${orderId}`);

export default api;