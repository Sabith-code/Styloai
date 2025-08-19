import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user && typeof user.getIdToken === 'function') {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers.Authorization = `Bearer mock-token-${Date.now()}`;
    }
  } catch (error) {
    console.warn('Failed to get auth token:', error);
  }
  return config;
});

export const apiClient = {
  // Questionnaire
  saveQuestionnaire: async (userId: string, formData: any) => {
    const response = await api.post('/api/questionnaire', { userId, ...formData });
    return response.data;
  },

  getQuestionnaire: async (userId: string) => {
    const response = await api.get(`/api/questionnaire/${userId}`);
    return response.data;
  },

  // Wardrobe
  addWardrobeItem: async (item: {
    userId: string;
    type: string;
    color: string;
    nature: string;
    imageUrl: string; // should be secure_url from Cloudinary
    material: string;
    brand: string;
    size: string;
  }) => {
    // Ensure you always send full Cloudinary secure_url
    if (!item.imageUrl.startsWith('http')) {
      throw new Error('Invalid imageUrl: must be a full Cloudinary URL');
    }
    const response = await api.post('/api/wardrobe', item);
    return response.data;
  },

  getWardrobe: async (userId: string) => {
    const response = await api.get(`/api/wardrobe/${userId}`);
    return response.data;
  },

  deleteWardrobeItem: async (userId: string, itemId: string) => {
    // Backend expects both userId + itemId
    const response = await api.delete(`/api/wardrobe/${userId}/${itemId}`);
    return response.data;
  },

  // Recommendations
  getRecommendations: async (userId: string) => {
    // Backend will fetch questionnaire + wardrobe by userId
    const response = await api.post('/api/recommend', { userId });
    return response.data;
  },

  // Voice
  sendVoiceMessage: async (text: string, userId: string) => {
    const response = await api.post('/api/voice', { text, userId });
    return response.data;
  },
};

export default api;
