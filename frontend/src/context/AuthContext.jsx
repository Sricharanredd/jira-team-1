import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem('token');
    if (token) {
       fetchCurrentUser();
    } else {
       setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
        const res = await api.get('/auth/me'); // We need to ensure api.js attaches token
        setCurrentUser(res.data);
        setIsAuthenticated(true);
        return true;
    } catch (err) {
        console.error("Failed to fetch user", err);
        logout();
        return false;
    } finally {
        setLoading(false);
    }
  };

  const login = async (email, password) => {
      // Form Data for OAuth2
      const formData = new URLSearchParams();
      formData.append('username', email); 
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const { access_token } = res.data;
      
      localStorage.setItem('token', access_token);
      const success = await fetchCurrentUser();
      if (!success) {
          throw new Error("Login failed during user retrieval");
      }
      return true;
  };

  const register = async (name, email, password, confirm_password, role) => {
      const res = await api.post('/auth/register', { name, email, password, confirm_password, role });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      await fetchCurrentUser();
      return true;
  };

  const logout = () => {
      localStorage.removeItem('token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
        currentUser,
        isAuthenticated,
        login,
        register,
        logout,
        loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
