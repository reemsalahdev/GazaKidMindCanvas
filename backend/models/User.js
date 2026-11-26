const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  institutionName: {
    type: String,
    default: 'مركز الأمل للتأهيل النفسي',
  },
  averageChildren: {
    type: Number,
    default: 0,
  },
  licenseNumber: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: 'غزة - حي الرمال',
  },
  contactNumber: {
    type: String,
    default: '0599 123 456',
  },
  logo: {
    type: String,
    default: null,
  },
  openaiConfig: {
    baseUrl: {
      type: String,
      default: '',
      select: false, // Hide by default for security
    },
    apiKey: {
      type: String,
      default: '',
      select: false, // Hide by default for security
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;