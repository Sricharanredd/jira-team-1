import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

// AuthProvider manages global authentication state and provides login/logout functions to entire app
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On app load, check if JWT token exists and fetch current user data
  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem('token');
    if (token) {
       fetchCurrentUser();
    } else {
       setLoading(false);
    }
  }, []);

  // Fetch logged-in user details from backend using stored JWT token
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

  // Login function: sends credentials to backend, receives JWT token, and stores in localStorage
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

  // Register new user: creates account and automatically logs them in
  const register = async (name, email, password, confirm_password, role) => {
      const res = await api.post('/auth/register', { name, email, password, confirm_password, role });
      const { access_token } = res.data;
      localStorage.setItem('token', access_token);
      await fetchCurrentUser();
      return true;
  };

  // Logout: clear token from localStorage and reset authentication state
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
