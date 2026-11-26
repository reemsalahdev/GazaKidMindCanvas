import api from './api';

const drawingsService = {
  // Upload a new drawing
  uploadDrawing: async (drawingData) => {
    try {
      const formData = new FormData();
      formData.append('image', drawingData.image);
      formData.append('childId', drawingData.childId);
      formData.append('title', drawingData.title || '');
      formData.append('description', drawingData.description || '');
      
      if (drawingData.context) {
        formData.append('context', JSON.stringify(drawingData.context));
      }
      
      const response = await api.post('/drawings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading drawing:', error);
      throw error;
    }
  },

  // Analyze a drawing
  analyzeDrawing: async (drawingId) => {
    try {
      const response = await api.post(`/drawings/${drawingId}/analyze`);
      return response.data;
    } catch (error) {
      console.error('Error analyzing drawing:', error);
      throw error;
    }
  },

  // Get all drawings with filters
  getDrawings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        childId: params.childId || '',
        status: params.status || 'all',
        isAnalyzed: params.isAnalyzed || ''
      });
      
      // Remove empty parameters
      Array.from(queryParams.keys()).forEach(key => {
        if (queryParams.get(key) === '') {
          queryParams.delete(key);
        }
      });
      
      const response = await api.get(`/drawings?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drawings:', error);
      throw error;
    }
  },

  // Get single drawing by ID
  getDrawing: async (id) => {
    try {
      const response = await api.get(`/drawings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drawing:', error);
      throw error;
    }
  },

  // Update drawing
  updateDrawing: async (id, drawingData) => {
    try {
      const response = await api.put(`/drawings/${id}`, drawingData);
      return response.data;
    } catch (error) {
      console.error('Error updating drawing:', error);
      throw error;
    }
  },

  // Delete drawing
  deleteDrawing: async (id) => {
    try {
      const response = await api.delete(`/drawings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting drawing:', error);
      throw error;
    }
  },

  // Update emotional status for drawing
  updateEmotionalStatus: async (id, psychologicalState) => {
    try {
      const response = await api.put(`/drawings/${id}/emotional-status`, {
        psychologicalState
      });
      return response.data;
    } catch (error) {
      console.error('Error updating emotional status:', error);
      throw error;
    }
  },

  // Get drawing statistics for a child
  getChildDrawingStats: async (childId) => {
    try {
      const response = await api.get(`/drawings/child/${childId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drawing statistics:', error);
      throw error;
    }
  },

  // Add professional notes
  addProfessionalNotes: async (drawingId, notes) => {
    try {
      const response = await api.put(`/drawings/${drawingId}`, {
        professionalNotes: notes
      });
      return response.data;
    } catch (error) {
      console.error('Error adding professional notes:', error);
      throw error;
    }
  }
};

export default drawingsService;