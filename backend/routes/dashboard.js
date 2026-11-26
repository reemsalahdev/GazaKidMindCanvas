const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Child = require('../models/Child');
const Drawing = require('../models/Drawing');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total children count
    const totalChildren = await Child.countDocuments({ user: userId, isActive: true });

    // Get drawings statistics
    const totalDrawings = await Drawing.countDocuments({ user: userId });
    const analyzedDrawings = await Drawing.countDocuments({ 
      user: userId, 
      isAnalyzed: true 
    });
    const pendingAnalysis = await Drawing.countDocuments({ 
      user: userId, 
      status: 'pending' 
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDrawings = await Drawing.countDocuments({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get recently added children (last 7 days)
    const recentChildren = await Child.countDocuments({
      user: userId,
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get children by groups
    const childrenByGroup = await Child.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: '$group', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get average emotional indicators across all children
    const emotionalAverages = await Child.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          avgHappiness: { $avg: '$emotionalStatus.happiness' },
          avgSadness: { $avg: '$emotionalStatus.sadness' },
          avgAnger: { $avg: '$emotionalStatus.anger' },
          avgFear: { $avg: '$emotionalStatus.fear' },
          avgAnxiety: { $avg: '$emotionalStatus.anxiety' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalChildren,
          totalDrawings,
          analyzedDrawings,
          pendingAnalysis,
          recentDrawings,
          recentChildren,
          analysisRate: totalDrawings > 0 ? Math.round((analyzedDrawings / totalDrawings) * 100) : 0
        },
        childrenByGroup,
        emotionalAverages: emotionalAverages[0] || {
          avgHappiness: 0,
          avgSadness: 0,
          avgAnger: 0,
          avgFear: 0,
          avgAnxiety: 0
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات لوحة التحكم'
    });
  }
});

// @desc    Get mental health indicators
// @route   GET /api/dashboard/mental-health
// @access  Private
router.get('/mental-health', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get psychological indicators averages
    const psychologicalAverages = await Child.aggregate([
      { $match: { user: userId, isActive: true } },
      {
        $group: {
          _id: null,
          selfConfidence: { $avg: '$psychologicalIndicators.selfConfidence' },
          socialInteraction: { $avg: '$psychologicalIndicators.socialInteraction' },
          emotionalExpression: { $avg: '$psychologicalIndicators.emotionalExpression' },
          adaptability: { $avg: '$psychologicalIndicators.adaptability' },
          cognitiveAbility: { $avg: '$psychologicalIndicators.cognitiveAbility' }
        }
      }
    ]);

    // Get children requiring attention (those with any indicator below 40)
    const childrenNeedingAttention = await Child.find({
      user: userId,
      isActive: true,
      $or: [
        { 'psychologicalIndicators.selfConfidence': { $lt: 40 } },
        { 'psychologicalIndicators.socialInteraction': { $lt: 40 } },
        { 'psychologicalIndicators.emotionalExpression': { $lt: 40 } },
        { 'psychologicalIndicators.adaptability': { $lt: 40 } },
        { 'psychologicalIndicators.cognitiveAbility': { $lt: 40 } }
      ]
    }).select('name profileImage psychologicalIndicators');

    res.json({
      success: true,
      data: {
        indicators: psychologicalAverages[0] || {
          selfConfidence: 50,
          socialInteraction: 50,
          emotionalExpression: 50,
          adaptability: 50,
          cognitiveAbility: 50
        },
        childrenNeedingAttention: childrenNeedingAttention.map(child => ({
          id: child._id,
          name: child.name,
          profileImage: child.profileImage,
          lowestIndicator: getLowestIndicator(child.psychologicalIndicators)
        }))
      }
    });
  } catch (error) {
    console.error('Mental health indicators error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مؤشرات الصحة النفسية'
    });
  }
});

// @desc    Get psychological chart data
// @route   GET /api/dashboard/chart-data
// @access  Private
router.get('/chart-data', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '7days' } = req.query;

    let startDate = new Date();
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '6months') {
      startDate.setMonth(startDate.getMonth() - 6);
    }

    // Get drawings with analysis over time
    const drawingsOverTime = await Drawing.aggregate([
      {
        $match: {
          user: userId,
          isAnalyzed: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          avgHappiness: { $avg: '$analysis.psychologicalState.happiness' },
          avgSadness: { $avg: '$analysis.psychologicalState.sadness' },
          avgAnger: { $avg: '$analysis.psychologicalState.anger' },
          avgFear: { $avg: '$analysis.psychologicalState.fear' },
          avgAnxiety: { $avg: '$analysis.psychologicalState.anxiety' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        chartData: drawingsOverTime,
        period
      }
    });
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الرسم البياني'
    });
  }
});

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
router.get('/recent-activities', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get recent drawings
    const recentDrawings = await Drawing.find({ user: userId })
      .populate('child', 'name profileImage')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .select('title imageUrl status createdAt child');

    // Get recently added children
    const recentChildren = await Child.find({ user: userId })
      .sort('-createdAt')
      .limit(5)
      .select('name profileImage createdAt');

    const activities = [];

    // Combine activities
    recentDrawings.forEach(drawing => {
      activities.push({
        type: 'drawing',
        title: `رسمة جديدة: ${drawing.title}`,
        childName: drawing.child?.name || 'Unknown',
        childImage: drawing.child?.profileImage,
        date: drawing.createdAt,
        status: drawing.status,
        drawingId: drawing._id
      });
    });

    recentChildren.forEach(child => {
      activities.push({
        type: 'child',
        title: `طفل جديد: ${child.name}`,
        childName: child.name,
        childImage: child.profileImage,
        date: child.createdAt,
        childId: child._id
      });
    });

    // Sort by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: activities.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الأنشطة الحديثة'
    });
  }
});

// Helper function to get lowest indicator
function getLowestIndicator(indicators) {
  const indicatorNames = {
    selfConfidence: 'الثقة بالنفس',
    socialInteraction: 'التفاعل الاجتماعي',
    emotionalExpression: 'التعبير العاطفي',
    adaptability: 'القدرة على التكيف',
    cognitiveAbility: 'القدرة المعرفية'
  };

  let lowestName = '';
  let lowestValue = 100;

  Object.entries(indicators.toObject()).forEach(([key, value]) => {
    if (indicatorNames[key] && value < lowestValue) {
      lowestValue = value;
      lowestName = indicatorNames[key];
    }
  });

  return { name: lowestName, value: lowestValue };
}

module.exports = router;