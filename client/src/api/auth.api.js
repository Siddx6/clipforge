import api from '../utils/axiosInstance';

export const registerUser = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password });
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};

export const logoutUser = async () => {
  await api.post('/auth/logout');
  localStorage.removeItem('accessToken');
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh');
  localStorage.setItem('accessToken', data.accessToken);
  return data;
};