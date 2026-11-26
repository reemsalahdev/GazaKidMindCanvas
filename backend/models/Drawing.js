const mongoose = require('mongoose');

const drawingSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  analysis: {
    // AI Analysis Results
    aiAnalysis: {
      overallAssessment: {
        type: String,
        default: '',
      },
      emotionalIndicators: {
        type: String,
        default: '',
      },
      colorUsage: {
        type: String,
        default: '',
      },
      shapes: {
        type: String,
        default: '',
      },
      symbolism: {
        type: String,
        default: '',
      },
      developmentalLevel: {
        type: String,
        default: '',
      },
      concerns: [{
        type: String,
      }],
      strengths: [{
        type: String,
      }],
    },
    // Psychological State at time of drawing
    psychologicalState: {
      happiness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      sadness: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      anger: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      fear: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      anxiety: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
    },
    // Manual professional notes
    professionalNotes: {
      type: String,
      default: '',
    },
    // AI Generated Recommendations
    recommendations: [{
      title: String,
      description: String,
      priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
      },
      category: {
        type: String,
        enum: ['therapeutic', 'educational', 'behavioral', 'social', 'family'],
        default: 'therapeutic',
      },
    }],
    // Metadata for recommendations (summaries, generation info)
    recommendationMetadata: {
      drawingSummaries: [{
        drawingId: String,
        drawingTitle: String,
        drawingDate: Date,
        summary: String
      }],
      generatedAt: Date,
      basedOnDrawings: Number
    },
    // Analysis confidence score
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  // Drawing context
  context: {
    environment: {
      type: String,
      enum: ['clinic', 'home', 'school', 'other'],
      default: 'clinic',
    },
    mood: {
      type: String,
      default: '',
    },
    activity: {
      type: String,
      default: '',
    },
    sessionNotes: {
      type: String,
      default: '',
    },
  },
  tags: [{
    type: String,
    trim: true,
  }],
  isAnalyzed: {
    type: Boolean,
    default: false,
  },
  analyzedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'analyzing', 'completed', 'failed'],
    default: 'pending',
  },
  error: {
    type: String,
    default: null,
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
drawingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add indexes for better query performance
drawingSchema.index({ child: 1, createdAt: -1 });
drawingSchema.index({ user: 1, status: 1 });
drawingSchema.index({ child: 1, isAnalyzed: 1 });

// Virtual for age of drawing
drawingSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Method to format analysis for display
drawingSchema.methods.getFormattedAnalysis = function() {
  if (!this.isAnalyzed) {
    return null;
  }
  
  return {
    summary: this.analysis.aiAnalysis.overallAssessment,
    emotionalState: this.analysis.psychologicalState,
    keyFindings: {
      concerns: this.analysis.aiAnalysis.concerns,
      strengths: this.analysis.aiAnalysis.strengths,
    },
    recommendations: this.analysis.recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }),
  };
};

const Drawing = mongoose.model('Drawing', drawingSchema);

module.exports = Drawing;