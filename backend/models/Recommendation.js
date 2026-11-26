const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['therapeutic', 'educational', 'behavioral', 'social', 'family'],
    default: 'therapeutic'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['positive', 'warning', 'action'],
    default: 'action'
  },
  // Link to the drawings that were analyzed to generate this recommendation
  basedOnDrawings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drawing'
  }],
  // Store the summary of drawings used for this recommendation
  drawingSummaries: [{
    drawingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Drawing'
    },
    drawingTitle: String,
    drawingDate: Date,
    summary: String,
    status: {
      type: String,
      enum: ['analyzed', 'analyzed_on_fly', 'error'],
      default: 'analyzed'
    }
  }],
  // Metadata about the generation
  generationMetadata: {
    totalDrawingsAnalyzed: {
      type: Number,
      default: 0
    },
    generatedAt: {
      type: Date,
      default: Date.now
    },
    modelUsed: {
      type: String,
      default: 'gpt-4o'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
recommendationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
recommendationSchema.index({ child: 1, createdAt: -1 });
recommendationSchema.index({ child: 1, priority: 1, createdAt: -1 });
recommendationSchema.index({ child: 1, isActive: 1, createdAt: -1 });

// Virtual for age of recommendation
recommendationSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to check if recommendation is recent (less than 30 days old)
recommendationSchema.methods.isRecent = function() {
  return this.ageInDays <= 30;
};

// Static method to get active recommendations for a child
recommendationSchema.statics.getActiveForChild = async function(childId) {
  return this.find({
    child: childId,
    isActive: true
  })
  .sort({ priority: 1, createdAt: -1 })
  .populate('basedOnDrawings', 'title createdAt');
};

// Static method to deactivate old recommendations for a child
recommendationSchema.statics.deactivateOldRecommendations = async function(childId, keepCount = 10) {
  const recentRecommendations = await this.find({
    child: childId,
    isActive: true
  })
  .sort({ createdAt: -1 })
  .limit(keepCount)
  .select('_id');

  const recentIds = recentRecommendations.map(r => r._id);

  // Deactivate all recommendations except the most recent ones
  await this.updateMany(
    {
      child: childId,
      _id: { $nin: recentIds }
    },
    {
      isActive: false
    }
  );
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;