import api from './api';

const recommendationsService = {
  // Generate smart recommendations for a child
  generateRecommendations: async (childId, count = 4) => {
    try {
      const response = await api.post(`/recommendations/generate/${childId}`, { count });
      return response.data;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  },

  // Get all recommendations for a child
  getRecommendations: async (childId) => {
    try {
      const response = await api.get(`/recommendations/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },

  // Get recommendations history for a child
  getRecommendationsHistory: async (childId) => {
    try {
      const response = await api.get(`/recommendations/${childId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations history:', error);
      throw error;
    }
  },

  // Clear all recommendations and analysis for a child
  clearRecommendations: async (childId) => {
    try {
      const response = await api.delete(`/recommendations/${childId}/clear`);
      return response.data;
    } catch (error) {
      console.error('Error clearing recommendations:', error);
      throw error;
    }
  }
};

export default recommendationsService;