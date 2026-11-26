import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  // Get mental health indicators
  getMentalHealthIndicators: async () => {
    try {
      const response = await api.get('/dashboard/mental-health');
      return response.data;
    } catch (error) {
      console.error('Error fetching mental health indicators:', error);
      throw error;
    }
  },

  // Get chart data
  getChartData: async (period = '7days') => {
    try {
      const response = await api.get(`/dashboard/chart-data?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
};

export default dashboardService;