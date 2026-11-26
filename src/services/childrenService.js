import api from './api';

const childrenService = {
  // Get all children with filters and pagination
  getChildren: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        group: params.group || 'all',
        sortBy: params.sortBy || 'name',
        sortOrder: params.sortOrder || 'asc'
      });
      
      // إضافة فلتر الجنس إذا تم تحديده
      if (params.gender && params.gender !== 'all') {
        queryParams.append('gender', params.gender);
      }
      
      // إضافة فلتر الحالة إذا تم تحديده
      if (params.status && params.status !== 'all') {
        queryParams.append('status', params.status);
      }
      
      const response = await api.get(`/children?${queryParams}`);
      console.log('Get children response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },

  // Get single child by ID
  getChild: async (id) => {
    try {
      // Validate ID before making API call
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid child ID');
      }
      const response = await api.get(`/children/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child:', error);
      throw error;
    }
  },

  // Create new child
  createChild: async (childData) => {
    try {
      console.log('Creating child with data:', childData);
      const response = await api.post('/children', childData);
      console.log('Create child response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating child:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Update child
  updateChild: async (id, childData) => {
    try {
      const response = await api.put(`/children/${id}`, childData);
      return response.data;
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  },

  // Delete child (soft delete)
  deleteChild: async (id) => {
    try {
      const response = await api.delete(`/children/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting child:', error);
      throw error;
    }
  },

  // Get all groups
  getGroups: async () => {
    try {
      const response = await api.get('/children/groups/list');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // Create new group
  createGroup: async (groupData) => {
    try {
      const response = await api.post('/children/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Update group
  updateGroup: async (id, groupData) => {
    try {
      const response = await api.put(`/children/groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (id) => {
    try {
      const response = await api.delete(`/children/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  // Update emotional status
  updateEmotionalStatus: async (id, emotionalStatus) => {
    try {
      // Validate ID before making API call
      if (!id || id === 'undefined' || id === 'null') {
        throw new Error('Invalid child ID');
      }
      const response = await api.put(`/children/${id}/emotional-status`, {
        emotionalStatus
      });
      return response.data;
    } catch (error) {
      console.error('Error updating emotional status:', error);
      throw error;
    }
  },

  // Update psychological indicators
  updatePsychologicalIndicators: async (id, psychologicalIndicators) => {
    try {
      const response = await api.put(`/children/${id}/psychological-indicators`, {
        psychologicalIndicators
      });
      return response.data;
    } catch (error) {
      console.error('Error updating psychological indicators:', error);
      throw error;
    }
  },

  // Get child's drawings
  getChildDrawings: async (childId, params = {}) => {
    try {
      // Validate ID before making API call
      if (!childId || childId === 'undefined' || childId === 'null') {
        throw new Error('Invalid child ID');
      }
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status || 'all'
      });
      
      const response = await api.get(`/children/${childId}/drawings?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child drawings:', error);
      throw error;
    }
  },

  // Upload profile image for child
  uploadProfileImage: async (childId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/children/${childId}/profile-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};

export default childrenService;