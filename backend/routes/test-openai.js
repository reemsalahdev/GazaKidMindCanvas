const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const openaiService = require('../services/openaiService');

// @desc    Test OpenAI configuration
// @route   GET /api/test-openai
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Try to get OpenAI config
    const config = await openaiService.getOpenAIConfig(req.user._id);
    
    // Check if config exists
    if (!config.baseUrl || !config.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'OpenAI configuration not found. Please configure your OpenAI settings in the Settings page.',
        hasConfig: false
      });
    }
    
    // Test the configuration with a simple request
    const axios = require('axios');
    try {
      const testResponse = await axios.post(
        `${config.baseUrl}/chat/completions`,
        {
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: "Say 'Hello' in Arabic"
            }
          ],
          max_tokens: 50
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      res.json({
        success: true,
        message: 'OpenAI configuration is working correctly',
        hasConfig: true,
        testResponse: testResponse.data.choices[0].message.content
      });
    } catch (apiError) {
      console.error('OpenAI API test error:', apiError.response?.data || apiError.message);
      res.status(400).json({
        success: false,
        message: 'OpenAI API test failed. Please check your API key and base URL.',
        hasConfig: true,
        error: apiError.response?.data?.error?.message || apiError.message
      });
    }
    
  } catch (error) {
    console.error('Test OpenAI error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error testing OpenAI configuration'
    });
  }
});

module.exports = router;