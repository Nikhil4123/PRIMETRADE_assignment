import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import { meApi } from '../api/auth.api';
import { setAxiosAuthHandlers } from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAxiosAuthHandlers({
      getToken: () => localStorage.getItem('token'),
      onUnauthorized: () => {
        logout();
        globalThis.location.href = '/login';
      }
    });
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await meApi();
        setUser(profile.data);
        localStorage.setItem('user', JSON.stringify(profile.data));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token]);

  const login = async (authToken, userData = null) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);

    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return;
    }

    try {
      const profile = await meApi();
      setUser(profile.data);
      localStorage.setItem('user', JSON.stringify(profile.data));
    } catch {
      const decoded = jwtDecode(authToken);
      const fallbackUser = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        name: decoded.email
      };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = () => Boolean(token);
  const isAdmin = () => user?.role === 'admin';

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isAdmin
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
