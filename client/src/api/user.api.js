import api from '../utils/axiosInstance';

export const updateProfile = async (name) => {
  const { data } = await api.put('/users/profile', { name });
  return data;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put('/users/password', { currentPassword, newPassword });
  return data;
};

export const deleteAccount = async () => {
  const { data } = await api.delete('/users/account');
  return data;
};