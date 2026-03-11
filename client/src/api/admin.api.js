import api from '../utils/axiosInstance';

export const getAdminAnalytics = async () => {
  const { data } = await api.get('/admin/analytics');
  return data;
};

export const getAdminUsers = async (page = 1, limit = 20) => {
  const { data } = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return data;
};

export const updateAdminUser = async (id, updates) => {
  const { data } = await api.put(`/admin/users/${id}`, updates);
  return data;
};

export const deleteAdminUser = async (id) => {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
};