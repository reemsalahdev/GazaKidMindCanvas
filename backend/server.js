const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dashboardRoutes = require('./routes/dashboard');
const childrenRoutes = require('./routes/children');
const drawingsRoutes = require('./routes/drawings');
const recommendationsRoutes = require('./routes/recommendations');
const testOpenAIRoutes = require('./routes/test-openai');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fallback for legacy drawing file locations:
// If /uploads/drawings/:filename does not exist, try /uploads/:filename
app.get('/uploads/drawings/:filename', (req, res, next) => {
  const drawingsPath = path.join(__dirname, 'uploads', 'drawings', req.params.filename);
  fs.access(drawingsPath, fs.constants.F_OK, (err) => {
    if (!err) {
      return res.sendFile(drawingsPath);
    }
    const rootPath = path.join(__dirname, 'uploads', req.params.filename);
    fs.access(rootPath, fs.constants.F_OK, (err2) => {
      if (!err2) {
        return res.sendFile(rootPath);
      }
      return next();
    });
  });
});

// Static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/drawings', drawingsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/test-openai', testOpenAIRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    success: false
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gazakid-mindcanvas');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});