import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useState, useCallback, useEffect } from 'react';
import { debugLog } from '../utils/debugLog';
import { API_BASE_URL } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [logoutTrigger, setLogoutTrigger] = useState(0);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('user');
      const userTypeData = await AsyncStorage.getItem('userType');

      debugLog('Auth', 'Bootstrap:', { userToken, userData, userTypeData });

      if (userToken && userData && userTypeData) {
        setToken(userToken);
        setUser(JSON.parse(userData));
        setUserType(userTypeData);
      }
    } catch (e) {
      debugLog('Auth', 'Bootstrap Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const customerSignup = useCallback(async (fullName, email, password) => {
    try {
      debugLog('Auth', 'Customer Signup:', { fullName, email });

      const response = await fetch(`${API_BASE_URL}/auth/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword: password }),
      });

      const data = await response.json();
      debugLog('Auth', 'Signup Response:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Signup failed' };
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('userType', 'customer');

      setToken(data.token);
      setUser(data.user);
      setUserType('customer');

      return { success: true };
    } catch (error) {
      debugLog('Auth', 'Signup Error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const customerLogin = useCallback(async (email, password) => {
    try {
      debugLog('Auth', 'Customer Login:', { email });

      const response = await fetch(`${API_BASE_URL}/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      debugLog('Auth', 'Login Response:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      await AsyncStorage.setItem('userType', 'customer');

      setToken(data.token);
      setUser(data.user);
      setUserType('customer');

      return { success: true };
    } catch (error) {
      debugLog('Auth', 'Login Error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Unable to create reset code' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const resetPassword = useCallback(async (email, code, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          password,
          confirmPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Unable to reset password' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const resetPasswordWithToken = useCallback(async (resetToken, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/customer/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          confirmPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Unable to reset password' };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const pharmacySignup = useCallback(
    async (fullName, pharmacyName, email, password, address, phone, latitude, longitude) => {
    try {
      debugLog('Auth', 'Pharmacy Signup:', { fullName, pharmacyName, email });

      const response = await fetch(`${API_BASE_URL}/auth/pharmacy/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName, 
          pharmacyName, 
          email, 
          password,
          confirmPassword: password,
          address,
          phone,
          latitude,
          longitude,
        }),
      });

      const data = await response.json();
      debugLog('Auth', 'Pharmacy Signup Response:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Signup failed' };
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.pharmacy));
      await AsyncStorage.setItem('userType', 'admin');

      setToken(data.token);
      setUser(data.pharmacy);
      setUserType('admin');

      return { success: true, data };
    } catch (error) {
      debugLog('Auth', 'Pharmacy Signup Error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const pharmacyLogin = useCallback(async (email, password) => {
    try {
      debugLog('Auth', 'Pharmacy Login:', { email });

      const response = await fetch(`${API_BASE_URL}/auth/pharmacy/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      debugLog('Auth', 'Pharmacy Login Response:', data);

      if (!response.ok) {
        return { success: false, error: data.message || 'Login failed' };
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.pharmacy));
      await AsyncStorage.setItem('userType', 'admin');

      setToken(data.token);
      setUser(data.pharmacy);
      setUserType('admin');

      return { success: true, data };
    } catch (error) {
      debugLog('Auth', 'Pharmacy Login Error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      debugLog('Auth', 'Logout called');
      
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');

      setToken(null);
      setUser(null);
      setUserType(null);
      setLogoutTrigger((current) => current + 1);

      return { success: true };
    } catch (error) {
      debugLog('Auth', 'Logout Error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        loading,
        token,
        logoutTrigger,
        customerSignup,
        customerLogin,
        requestPasswordReset,
        resetPassword,
        resetPasswordWithToken,
        pharmacySignup,
        pharmacyLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
