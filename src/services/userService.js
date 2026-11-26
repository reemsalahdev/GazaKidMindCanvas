import api from './api';

const userService = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile'
      };
    }
  },

  // Update profile information (general info)
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      
      if (response.data.success) {
        // Update user info in localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return {
        success: response.data.success,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile'
      };
    }
  },

  // Update account settings (email & password)
  updateAccount: async (accountData) => {
    try {
      const response = await api.put('/user/account', accountData);
      
      if (response.data.success && accountData.email) {
        // Update email in localStorage if it was changed
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.email = response.data.user.email;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      return {
        success: response.data.success,
        message: response.data.message,
        user: response.data.user
      };
    } catch (error) {
      console.error('Update account error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update account settings'
      };
    }
  },

  // Update OpenAI configuration
  updateOpenAIConfig: async (configData) => {
    try {
      const response = await api.put('/user/openai-config', configData);
      
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      console.error('Update OpenAI config error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update OpenAI configuration'
      };
    }
  },

  // Get OpenAI configuration status
  getOpenAIConfigStatus: async () => {
    try {
      const response = await api.get('/user/openai-config-status');
      
      return {
        success: response.data.success,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get OpenAI config status error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch OpenAI configuration status',
        data: {
          hasBaseUrl: false,
          hasApiKey: false,
          baseUrl: ''
        }
      };
    }
  }
};

export default userService;