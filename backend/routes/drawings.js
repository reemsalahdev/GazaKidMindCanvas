const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError, getFileUrl } = require('../middleware/upload');
const Drawing = require('../models/Drawing');
const Child = require('../models/Child');
const openaiService = require('../services/openaiService');
const fs = require('fs').promises;

// @desc    Upload a new drawing
// @route   POST /api/drawings/upload
// @access  Private
router.post('/upload', protect, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    const { childId, title, description, context } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء تحديد صورة للرفع'
      });
    }

    // Verify child exists and belongs to user
    const child = await Child.findOne({
      _id: childId,
      user: req.user._id
    });

    if (!child) {
      // Delete uploaded file
      await fs.unlink(req.file.path).catch(err => console.error('File deletion error:', err));
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Create drawing record
    const drawing = new Drawing({
      child: childId,
      user: req.user._id,
      title: title || `رسمة ${child.name} - ${new Date().toLocaleDateString('ar')}`,
      description: description || '',
      imageUrl: getFileUrl(req, req.file.filename, 'drawings'),
      context: context ? JSON.parse(context) : {},
      status: 'pending'
    });

    await drawing.save();

    res.status(201).json({
      success: true,
      data: drawing,
      message: 'تم رفع الرسمة بنجاح'
    });
  } catch (error) {
    console.error('Upload drawing error:', error);
    // Delete uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(err => console.error('File deletion error:', err));
    }
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الرسمة'
    });
  }
});

// @desc    Analyze a drawing
// @route   POST /api/drawings/:id/analyze
// @access  Private
router.post('/:id/analyze', protect, async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('child');

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'الرسمة غير موجودة'
      });
    }

    if (drawing.isAnalyzed) {
      return res.status(400).json({
        success: false,
        message: 'تم تحليل هذه الرسمة مسبقاً'
      });
    }

    // Update status to analyzing
    drawing.status = 'analyzing';
    await drawing.save();

    try {
      // Perform AI analysis
      const analysisResult = await openaiService.analyzeDrawing(
        drawing.imageUrl,
        drawing.child,
        req.user._id
      );

      // Update drawing with analysis results
      drawing.analysis.aiAnalysis = analysisResult.analysis;
      drawing.analysis.psychologicalState = openaiService.generateEmotionalScores(analysisResult.rawResponse);
      drawing.analysis.confidenceScore = openaiService.calculateConfidenceScore(analysisResult.analysis);
      drawing.isAnalyzed = true;
      drawing.analyzedAt = new Date();
      drawing.status = 'completed';
      
      await drawing.save();

      res.json({
        success: true,
        data: drawing,
        message: 'تم تحليل الرسمة بنجاح'
      });
    } catch (analysisError) {
      // Update status to failed
      drawing.status = 'failed';
      drawing.error = analysisError.message;
      await drawing.save();

      throw analysisError;
    }
  } catch (error) {
    console.error('Analyze drawing error:', error);
    res.status(error.message.includes('OpenAI configuration') ? 400 : 500).json({
      success: false,
      message: error.message || 'خطأ في تحليل الرسمة'
    });
  }
});

// @desc    Get all drawings
// @route   GET /api/drawings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      childId,
      status = 'all',
      isAnalyzed,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user._id };

    // Apply filters
    if (childId) {
      query.child = childId;
    }

    if (status !== 'all') {
      query.status = status;
    }

    if (isAnalyzed !== undefined) {
      query.isAnalyzed = isAnalyzed === 'true';
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const drawings = await Drawing.find(query)
      .populate('child', 'name profileImage')
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    const total = await Drawing.countDocuments(query);

    res.json({
      success: true,
      data: drawings,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get drawings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الرسومات'
    });
  }
});

// @desc    Get single drawing
// @route   GET /api/drawings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('child');

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'الرسمة غير موجودة'
      });
    }

    res.json({
      success: true,
      data: drawing
    });
  } catch (error) {
    console.error('Get drawing error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسمة'
    });
  }
});

// @desc    Update drawing
// @route   PUT /api/drawings/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, description, context, professionalNotes } = req.body;

    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'الرسمة غير موجودة'
      });
    }

    // Update fields
    if (title !== undefined) drawing.title = title;
    if (description !== undefined) drawing.description = description;
    if (context !== undefined) drawing.context = context;
    if (professionalNotes !== undefined) {
      drawing.analysis.professionalNotes = professionalNotes;
    }

    await drawing.save();

    res.json({
      success: true,
      data: drawing,
      message: 'تم تحديث بيانات الرسمة'
    });
  } catch (error) {
    console.error('Update drawing error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات الرسمة'
    });
  }
});

// @desc    Delete drawing
// @route   DELETE /api/drawings/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'الرسمة غير موجودة'
      });
    }

    // Delete the file
    if (drawing.imageUrl) {
      const filename = path.basename(drawing.imageUrl);
      const filePath = path.join(__dirname, '..', 'uploads', 'drawings', filename);
      await fs.unlink(filePath).catch(err => console.error('File deletion error:', err));
    }

    await drawing.remove();

    res.json({
      success: true,
      message: 'تم حذف الرسمة بنجاح'
    });
  } catch (error) {
    console.error('Delete drawing error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الرسمة'
    });
  }
});

// @desc    Update emotional status for drawing
// @route   PUT /api/drawings/:id/emotional-status
// @access  Private
router.put('/:id/emotional-status', protect, async (req, res) => {
  try {
    const { psychologicalState } = req.body;

    const drawing = await Drawing.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!drawing) {
      return res.status(404).json({
        success: false,
        message: 'الرسمة غير موجودة'
      });
    }

    // Update emotional status
    if (psychologicalState) {
      Object.keys(psychologicalState).forEach(key => {
        if (psychologicalState[key] !== undefined) {
          drawing.analysis.psychologicalState[key] = psychologicalState[key];
        }
      });
    }

    await drawing.save();

    res.json({
      success: true,
      data: drawing.analysis.psychologicalState,
      message: 'تم تحديث الحالة النفسية'
    });
  } catch (error) {
    console.error('Update emotional status error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الحالة النفسية'
    });
  }
});

// @desc    Get drawing statistics for a child
// @route   GET /api/drawings/child/:childId/stats
// @access  Private
router.get('/child/:childId/stats', protect, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.childId,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Get drawing statistics
    const totalDrawings = await Drawing.countDocuments({ 
      child: req.params.childId 
    });

    const analyzedDrawings = await Drawing.countDocuments({ 
      child: req.params.childId,
      isAnalyzed: true 
    });

    // Get emotional trends over time
    const emotionalTrends = await Drawing.aggregate([
      {
        $match: {
          child: child._id,
          isAnalyzed: true
        }
      },
      {
        $sort: { createdAt: 1 }
      },
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          happiness: '$analysis.psychologicalState.happiness',
          sadness: '$analysis.psychologicalState.sadness',
          anger: '$analysis.psychologicalState.anger',
          fear: '$analysis.psychologicalState.fear',
          anxiety: '$analysis.psychologicalState.anxiety'
        }
      }
    ]);

    // Get common themes from AI analysis
    const commonThemes = await Drawing.aggregate([
      {
        $match: {
          child: child._id,
          isAnalyzed: true
        }
      },
      {
        $unwind: '$analysis.aiAnalysis.concerns'
      },
      {
        $group: {
          _id: '$analysis.aiAnalysis.concerns',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        totalDrawings,
        analyzedDrawings,
        analysisRate: totalDrawings > 0 ? Math.round((analyzedDrawings / totalDrawings) * 100) : 0,
        emotionalTrends,
        commonThemes: commonThemes.map(theme => ({
          theme: theme._id,
          frequency: theme.count
        }))
      }
    });
  } catch (error) {
    console.error('Get drawing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات الرسومات'
    });
  }
});

module.exports = router;