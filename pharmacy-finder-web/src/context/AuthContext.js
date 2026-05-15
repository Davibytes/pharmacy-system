import React, { createContext, useState, useEffect } from 'react';
import { API_BASE } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('pharmacyToken');
    const savedUser = localStorage.getItem('pharmacyUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Pharmacy login request:', { email, password });

      const response = await fetch(`${API_BASE}/auth/pharmacy/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('pharmacyToken', data.token);
      localStorage.setItem('pharmacyUser', JSON.stringify(data.pharmacy));
      setToken(data.token);
      setUser(data.pharmacy);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE}/auth/pharmacy/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: `Request failed with status ${response.status}` };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email');
      }

      return {
        success: true,
        message: data.message || 'Password reset instructions have been sent to your email.',
        resetUrl: data.resetUrl,
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.message };
    }
  };

  const resetPassword = async (resetToken, password, confirmPassword) => {
    try {
      const response = await fetch(`${API_BASE}/auth/pharmacy/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { message: `Request failed with status ${response.status}` };

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      return {
        success: true,
        message: data.message || 'Your password has been reset successfully.',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (fullName, pharmacyName, email, password, confirmPassword, address, phone, latitude, longitude) => {
    try {
      console.log('Pharmacy signup request:', {
        fullName,
        pharmacyName,
        email,
        password,
        confirmPassword,
        address,
        phone,
        latitude,
        longitude,
      });

      const response = await fetch(`${API_BASE}/auth/pharmacy/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          pharmacyName,
          email,
          password,
          confirmPassword,
          address,
          phone,
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
        }),
      });

      const data = await response.json();
      console.log('Signup response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      localStorage.setItem('pharmacyToken', data.token);
      localStorage.setItem('pharmacyUser', JSON.stringify(data.pharmacy));
      setToken(data.token);
      setUser(data.pharmacy);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('pharmacyToken');
    localStorage.removeItem('pharmacyUser');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    const nextUser = { ...user, ...updates };
    localStorage.setItem('pharmacyUser', JSON.stringify(nextUser));
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, signup, forgotPassword, resetPassword, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
