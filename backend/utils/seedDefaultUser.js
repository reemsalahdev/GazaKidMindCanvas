const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedDefaultUser = async () => {
  try {
    // Check if default user already exists
    const defaultEmail = process.env.DEFAULT_EMAIL || 'admin@mindcanvas.com';
    const existingUser = await User.findOne({ email: defaultEmail });

    if (!existingUser) {
      // Create default user
      const defaultUser = new User({
        email: defaultEmail,
        password: process.env.DEFAULT_PASSWORD || 'Admin123!',
        institutionName: 'مركز الأمل للتأهيل النفسي',
        address: 'غزة - حي الرمال',
        contactNumber: '0599 123 456',
        role: 'admin',
        isActive: true,
      });

      await defaultUser.save();
      console.log('Default admin user created successfully');
      console.log(`Email: ${defaultEmail}`);
      console.log(`Password: ${process.env.DEFAULT_PASSWORD || 'Admin123!'}`);
    } else {
      console.log('Default admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding default user:', error);
  }
};

// If run directly
if (require.main === module) {
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gazakid-mindcanvas')
  .then(async () => {
    console.log('MongoDB connected');
    await seedDefaultUser();
    process.exit(0);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
}

module.exports = { seedDefaultUser };