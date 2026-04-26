import axiosInstance from './axiosInstance';

export const getTasksApi = async () => {
  const { data } = await axiosInstance.get('/api/v1/tasks');
  return data;
};

export const getTaskByIdApi = async (id) => {
  const { data } = await axiosInstance.get(`/api/v1/tasks/${id}`);
  return data;
};

export const createTaskApi = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/tasks', payload);
  return data;
};

export const updateTaskApi = async (id, payload) => {
  const { data } = await axiosInstance.put(`/api/v1/tasks/${id}`, payload);
  return data;
};

export const deleteTaskApi = async (id) => {
  const { data } = await axiosInstance.delete(`/api/v1/tasks/${id}`);
  return data;
};

export const getUsersAdminApi = async () => {
  const { data } = await axiosInstance.get('/api/v1/admin/users');
  return data;
};

export const deleteUserAdminApi = async (id) => {
  const { data } = await axiosInstance.delete(`/api/v1/admin/users/${id}`);
  return data;
};
