import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const Auth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('token');
      } catch {
        return null;
      }
    }
    return null;
  });

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
    // Fixed: Use the correct environment variable and port
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }, [token]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid
          const response = await axios.get('/auth/verify');
          
          // If verification fails but no error thrown, logout
          if (!response.data?.valid) {
            throw new Error('Token validation failed');
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Fixed: Remove dependency to prevent infinite loop

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }
    
    delete axios.defaults.headers.common['Authorization'];
  };

  // Fixed: Add Google OAuth login function
  const googleLogin = async (credentialResponse) => {
    setLoading(true);
    
    try {
      const id_token = credentialResponse.credential;

      const response = await axios.post('/auth/google', {
        id_token,
        action: 'signin'
      });

      if (response.data) {
        login(response.data.user, response.data.accessToken);
        return { 
          success: true, 
          user: response.data.user, 
          isNewUser: response.data.isNewUser 
        };
      }
    } catch (error) {
      console.error('Google login error:', error);
      logout();
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Add Google OAuth signup function
  const googleSignup = async (credentialResponse) => {
    setLoading(true);
    
    try {
      const id_token = credentialResponse.credential;

      const response = await axios.post('/auth/google', {
        id_token,
        action: 'signup'
      });

      if (response.data) {
        login(response.data.user, response.data.accessToken);
        return { 
          success: true, 
          user: response.data.user, 
          isNewUser: response.data.isNewUser 
        };
      }
    } catch (error) {
      console.error('Google signup error:', error);
      logout();
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Signup failed. Please try again.';
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Fixed: Add profile refresh function
  const refreshProfile = async () => {
    try {
      const response = await axios.get('/auth/profile');
      
      if (response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error('Profile refresh error:', error);
      
      // If profile refresh fails, user might need to re-authenticate
      logout();
      return { success: false, error: error.response?.data?.message || 'Failed to refresh profile' };
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    googleLogin,    // Fixed: Added Google login function
    googleSignup,   // Fixed: Added Google signup function
    refreshProfile, // Fixed: Added profile refresh function
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};