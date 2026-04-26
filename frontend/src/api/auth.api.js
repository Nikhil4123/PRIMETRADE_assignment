import axiosInstance from './axiosInstance';

export const registerApi = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/auth/register', payload);
  return data;
};

export const loginApi = async (payload) => {
  const { data } = await axiosInstance.post('/api/v1/auth/login', payload);
  return data;
};

export const meApi = async () => {
  const { data } = await axiosInstance.get('/api/v1/auth/me');
  return data;
};
