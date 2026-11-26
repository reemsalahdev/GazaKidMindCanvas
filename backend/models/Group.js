const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
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
  color: {
    type: String,
    required: true,
    default: '#ff9800',
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
  }],
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
groupSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure unique group names per user
groupSchema.index({ user: 1, name: 1 }, { unique: true });
groupSchema.index({ user: 1, isActive: 1 });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;