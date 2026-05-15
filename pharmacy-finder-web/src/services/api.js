export const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const pharmacyAPI = {
  getAll: async (token) => {
    const response = await fetch(`${API_BASE}/pharmacies`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  getById: async (id, token) => {
    const response = await fetch(`${API_BASE}/pharmacies/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};

export const authAPI = {
  getMe: async (token) => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },
};
