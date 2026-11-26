const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  try {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers['content-type']);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('VALIDATION FAILED:');
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    let { email, password } = req.body;
    console.log('Before normalization - Email:', email);
    console.log('Password received:', password ? `Yes (length: ${password.length})` : 'No');
    
    // Normalize email manually to handle the issue
    email = email.toLowerCase().trim();
    console.log('After normalization - Email:', email);

    // Check if user exists
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('USER NOT FOUND for email:', email);
      // Let's also check what users exist
      const allUsers = await User.find({}, 'email').lean();
      console.log('Existing users in database:', allUsers.map(u => u.email));
      
      return res.status(401).json({
        success: false,
        message: 'البريد الإلكتروني غير مسجل',
      });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      isActive: user.isActive,
      role: user.role
    });

    // Check if password matches
    console.log('Comparing passwords...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('PASSWORD MISMATCH');
      return res.status(401).json({
        success: false,
        message: 'كلمة المرور غير صحيحة',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('USER ACCOUNT IS DEACTIVATED');
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    // Generate token
    console.log('Generating token for user:', user._id);
    const token = generateToken(user._id);

    console.log('LOGIN SUCCESSFUL');
    
    // Return user data with token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        institutionName: user.institutionName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

module.exports = router;