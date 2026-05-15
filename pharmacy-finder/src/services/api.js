import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_BASE_URL = 'https://api.pharmacyfinder247.site';

const getPharmaciesFromResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.pharmacies)) {
    return data.pharmacies;
  }

  return [];
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AsyncStorage.removeItem('userToken');
      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('userType');
    }
    return Promise.reject(error);
  }
);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

export const authAPI = {
  customerSignup: (fullName, email, password) =>
    api.post('/auth/customer/signup', { fullName, email, password }),

  customerLogin: (email, password) =>
    api.post('/auth/customer/login', { email, password }),

  pharmacySignup: (
    fullName,
    pharmacyName,
    email,
    password,
    address,
    phone,
    latitude,
    longitude
  ) =>
    api.post('/auth/pharmacy/signup', {
      fullName,
      pharmacyName,
      email,
      password,
      address,
      phone,
      latitude,
      longitude,
    }),

  pharmacyLogin: (email, password) =>
    api.post('/auth/pharmacy/login', { email, password }),

  getCurrentUser: () => api.get('/auth/me'),
};

export const pharmacyAPI = {
  getNearby: async (latitude, longitude, maxDistance = 10) => {
    const response = await api.get('/pharmacies/nearby', {
      params: { latitude, longitude, maxDistance },
    });

    const pharmacies = getPharmaciesFromResponse(response.data);
    const pharmaciesWithDistance = pharmacies.map((pharmacy) => ({
      ...pharmacy,
      distance:
        typeof pharmacy.distance === 'number'
          ? pharmacy.distance
          : calculateDistance(
              latitude,
              longitude,
              pharmacy.latitude || 0,
              pharmacy.longitude || 0
            ),
    }));

    return { data: pharmaciesWithDistance };
  },

  getSearchableList: async (latitude, longitude, maxDistance = 25) => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return pharmacyAPI.getNearby(latitude, longitude, maxDistance);
    }

    return pharmacyAPI.getAll();
  },

  getAll: async () => {
    const response = await api.get('/pharmacies');
    return { data: getPharmaciesFromResponse(response.data) };
  },

  getById: async (id) => {
    const response = await api.get(`/pharmacies/${id}`);
    return { data: response.data };
  },

  filterByOpenStatus: (pharmacies, openOnly = false) => {
    if (!openOnly) return pharmacies;
    return pharmacies.filter((p) => p.isOpen);
  },

  sortByDistance: (pharmacies) => {
    return [...pharmacies].sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  sortByRating: (pharmacies) => {
    return [...pharmacies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  },

  sortByName: (pharmacies) => {
    return [...pharmacies].sort((a, b) =>
      (a.pharmacyName || '').localeCompare(b.pharmacyName || '')
    );
  },

  searchPharmacies: (pharmacies, query) => {
    if (!query.trim()) return pharmacies;
    const lowercaseQuery = query.toLowerCase();
    return pharmacies.filter(
      (pharmacy) =>
        (pharmacy.pharmacyName || '').toLowerCase().includes(lowercaseQuery) ||
        (pharmacy.address || '').toLowerCase().includes(lowercaseQuery)
    );
  },

  getDetails: async (id) => {
    const response = await api.get(`/pharmacies/${id}`);
    return { data: response.data };
  },

  updatePharmacy: async (id, data) => {
    const response = await api.put(`/pharmacies/${id}`, data);
    return { data: response.data };
  },

  addReview: async (pharmacyId, rating, comment) => {
    const response = await api.post(`/pharmacies/${pharmacyId}/reviews`, {
      rating,
      comment,
    });
    return { data: response.data };
  },

  getReviews: async (pharmacyId) => {
    const response = await api.get(`/pharmacies/${pharmacyId}/reviews`);
    return { data: response.data };
  },
};

export const medicineAPI = {
  search: async (query, latitude, longitude, maxDistance = 25) => {
    const params = { query, maxDistance };

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      params.latitude = latitude;
      params.longitude = longitude;
    }

    const response = await api.get('/medicines/search', {
      params,
    });

    return { data: getPharmaciesFromResponse(response.data) };
  },

  getByPharmacy: async (pharmacyId) => {
    const response = await api.get(`/medicines/pharmacy/${pharmacyId}`);
    return { data: Array.isArray(response.data?.medicines) ? response.data.medicines : [] };
  },
};

export const searchUtils = {
  applyFilters: (pharmacies, filters) => {
    let results = [...pharmacies];

    if (filters.searchQuery) {
      results = pharmacyAPI.searchPharmacies(results, filters.searchQuery);
    }

    if (filters.openOnly) {
      results = pharmacyAPI.filterByOpenStatus(results, true);
    }

    if (filters.sortBy === 'distance') {
      results = pharmacyAPI.sortByDistance(results);
    } else if (filters.sortBy === 'rating') {
      results = pharmacyAPI.sortByRating(results);
    } else if (filters.sortBy === 'name') {
      results = pharmacyAPI.sortByName(results);
    }

    return results;
  },

  filterByDistance: (pharmacies, maxDistance) => {
    return pharmacies.filter((p) => p.distance <= maxDistance);
  },

  filterByRating: (pharmacies, minRating) => {
    return pharmacies.filter((p) => (p.rating || 0) >= minRating);
  },
};

export default api;
