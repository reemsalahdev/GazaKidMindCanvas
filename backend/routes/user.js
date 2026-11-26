const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('institutionName').optional().trim(),
  body('averageChildren').optional().isNumeric(),
  body('licenseNumber').optional().trim(),
  body('address').optional().trim(),
  body('contactNumber').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      institutionName,
      averageChildren,
      licenseNumber,
      address,
      contactNumber,
    } = req.body;

    // Build update object
    const updateFields = {};
    if (institutionName !== undefined) updateFields.institutionName = institutionName;
    if (averageChildren !== undefined) updateFields.averageChildren = averageChildren;
    if (licenseNumber !== undefined) updateFields.licenseNumber = licenseNumber;
    if (address !== undefined) updateFields.address = address;
    if (contactNumber !== undefined) updateFields.contactNumber = contactNumber;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/user/account
// @desc    Update account settings (email & password)
// @access  Private
router.put('/account', protect, [
  body('email').optional().isEmail().normalizeEmail(),
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email is already taken
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
    }

    // Update password if provided
    if (newPassword) {
      user.password = newPassword; // Will be hashed by pre-save hook
    }

    await user.save();

    res.json({
      success: true,
      message: 'Account settings updated successfully',
      user: {
        id: user._id,
        email: user.email,
        institutionName: user.institutionName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @desc    Update OpenAI configuration
// @route   PUT /api/user/openai-config
// @access  Private
router.put('/openai-config', protect, [
  body('baseUrl').optional().isURL().withMessage('Invalid URL format'),
  body('apiKey').optional().isString().isLength({ min: 10 }).withMessage('API key must be at least 10 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { baseUrl, apiKey } = req.body;
    
    const user = await User.findById(req.user.id).select('+openaiConfig.baseUrl +openaiConfig.apiKey');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update OpenAI configuration
    if (baseUrl !== undefined) {
      user.openaiConfig.baseUrl = baseUrl;
    }
    if (apiKey !== undefined) {
      user.openaiConfig.apiKey = apiKey;
    }

    await user.save();

    res.json({
      success: true,
      message: 'تم تحديث إعدادات OpenAI بنجاح',
      data: {
        hasBaseUrl: !!user.openaiConfig.baseUrl,
        hasApiKey: !!user.openaiConfig.apiKey,
      }
    });
  } catch (error) {
    console.error('Update OpenAI config error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات OpenAI',
    });
  }
});

// @desc    Get OpenAI configuration status
// @route   GET /api/user/openai-config-status
// @access  Private
router.get('/openai-config-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+openaiConfig.baseUrl +openaiConfig.apiKey');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: {
        hasBaseUrl: !!user.openaiConfig.baseUrl,
        hasApiKey: !!user.openaiConfig.apiKey,
        baseUrl: user.openaiConfig.baseUrl || '',
      }
    });
  } catch (error) {
    console.error('Get OpenAI config status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب حالة إعدادات OpenAI',
    });
  }
});

module.exports = router;