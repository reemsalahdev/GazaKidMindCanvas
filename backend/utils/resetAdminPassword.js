const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gazakid-mindcanvas');
    console.log('MongoDB connected');
    
    // Find admin user
    const adminEmail = 'admin@mindcanvas.com';
    const user = await User.findOne({ email: adminEmail });
    
    if (!user) {
      console.log('Admin user not found!');
      process.exit(1);
    }
    
    console.log('Found admin user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });
    
    // Set new password
    const newPassword = 'Admin123!';
    user.password = newPassword;
    
    // Save will trigger the pre-save hook to hash the password
    await user.save();
    
    console.log('Password reset successfully!');
    console.log('New credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', newPassword);
    
    // Test the password
    const isMatch = await user.comparePassword(newPassword);
    console.log('Password verification test:', isMatch ? 'SUCCESS' : 'FAILED');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword();