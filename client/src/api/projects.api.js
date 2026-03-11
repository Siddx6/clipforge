import api from '../utils/axiosInstance';

export const getProjects = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/projects?page=${page}&limit=${limit}`);
  return data;
};

export const createProject = async (projectData) => {
  const { data } = await api.post('/projects', projectData);
  return data;
};

export const getProject = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const updateProject = async (id, projectData) => {
  const { data } = await api.put(`/projects/${id}`, projectData);
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};

export const generateProject = async (id) => {
  const { data } = await api.post(`/projects/${id}/generate`);
  return data;
};

export const getProjectStatus = async (id) => {
  const { data } = await api.get(`/projects/${id}/status`);
  return data;
};