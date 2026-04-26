import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let getTokenHandler = () => localStorage.getItem('token');
let unauthorizedHandler = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  globalThis.location.href = '/login';
};

export const setAxiosAuthHandlers = ({ getToken, onUnauthorized } = {}) => {
  if (typeof getToken === 'function') {
    getTokenHandler = getToken;
  }
  if (typeof onUnauthorized === 'function') {
    unauthorizedHandler = onUnauthorized;
  }
};

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getTokenHandler();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      !globalThis.location.pathname.includes('/login') &&
      !globalThis.location.pathname.includes('/register')
    ) {
      unauthorizedHandler();
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
