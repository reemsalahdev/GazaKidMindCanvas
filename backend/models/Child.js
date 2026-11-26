const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 18,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  group: {
    type: String,
    default: 'الافتراضي',
  },
  favoriteColor: {
    type: String,
    default: '#FF6B6B',
  },
  profileImage: {
    type: String,
    default: null,
  },
  additionalInfo: {
    medicalHistory: {
      type: String,
      default: '',
    },
    familyBackground: {
      type: String,
      default: '',
    },
    previousAssessments: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  emotionalStatus: {
    happiness: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    sadness: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    anger: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    fear: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    anxiety: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  psychologicalIndicators: {
    selfConfidence: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    socialInteraction: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    emotionalExpression: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    adaptability: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    cognitiveAbility: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
childSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add index for better query performance
childSchema.index({ user: 1, isActive: 1 });
childSchema.index({ user: 1, group: 1 });

const Child = mongoose.model('Child', childSchema);

module.exports = Child;