const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Drawing = require('../models/Drawing');
const Child = require('../models/Child');
const openaiService = require('../services/openaiService');

// @desc    Generate recommendations for a child
// @route   POST /api/recommendations/generate/:childId
// @access  Private
router.post('/generate/:childId', protect, async (req, res) => {
  try {
    const { count = 4 } = req.body;
    const childId = req.params.childId;

    // Verify child exists and belongs to user
    const child = await Child.findOne({
      _id: childId,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Get all drawings for the child (both analyzed and unanalyzed)
    const allDrawings = await Drawing.find({
      child: childId,
      user: req.user._id
    })
    .sort({ createdAt: -1 })
    .limit(10); // Get last 10 drawings

    console.log(`Found ${allDrawings.length} drawings for child ${child.name}`);

    // Separate analyzed and unanalyzed drawings
    const unanalyzedDrawings = allDrawings.filter(drawing => !drawing.isAnalyzed && drawing.imageUrl);
    const alreadyAnalyzedDrawings = allDrawings.filter(drawing => drawing.isAnalyzed);
    
    console.log(`Found ${unanalyzedDrawings.length} unanalyzed drawings and ${alreadyAnalyzedDrawings.length} already analyzed drawings`);

    // Analyze any unanalyzed drawings first
    const newlyAnalyzedDrawings = [];
    for (const drawing of unanalyzedDrawings) {
      try {
        console.log(`Analyzing drawing ${drawing._id}: ${drawing.title}`);
        
        // Set status to analyzing to prevent duplicate processing
        drawing.status = 'analyzing';
        await drawing.save();
        
        // Analyze the drawing using OpenAI
        const analysisResult = await openaiService.analyzeDrawing(
          drawing.imageUrl,
          child,
          req.user._id
        );

        if (analysisResult.success) {
          // Ensure analysis object exists
          if (!drawing.analysis) {
            drawing.analysis = {};
          }
          
          // Update the drawing with analysis results
          drawing.analysis.aiAnalysis = analysisResult.analysis;
          drawing.analysis.psychologicalState = openaiService.generateEmotionalScores(analysisResult.rawResponse);
          drawing.analysis.confidenceScore = openaiService.calculateConfidenceScore(analysisResult.analysis);
          drawing.analysis.analyzedAt = new Date();
          
          drawing.isAnalyzed = true;
          drawing.status = 'completed';
          drawing.analyzedAt = new Date();
          
          await drawing.save();
          console.log(`Successfully analyzed drawing ${drawing._id} with confidence score: ${drawing.analysis.confidenceScore}`);
          
          newlyAnalyzedDrawings.push(drawing);
        } else {
          // Mark as failed if analysis was unsuccessful
          drawing.status = 'failed';
          drawing.error = 'Analysis failed';
          await drawing.save();
          console.log(`Failed to analyze drawing ${drawing._id}: Analysis was not successful`);
        }
      } catch (analysisError) {
        console.error(`Failed to analyze drawing ${drawing._id}:`, analysisError);
        
        // Mark as failed and save error
        drawing.status = 'failed';
        drawing.error = analysisError.message || 'Unknown analysis error';
        await drawing.save();
        
        // Continue with other drawings even if one fails
      }
    }
    
    // Combine all analyzed drawings (previously analyzed + newly analyzed)
    const analyzedDrawings = [...alreadyAnalyzedDrawings, ...newlyAnalyzedDrawings];

    console.log(`Generating ${count} recommendations for child ${child.name} based on ${analyzedDrawings.length} analyzed drawings`);

    // Generate summaries for each drawing FIRST (if any exist) to include in recommendations
    const drawingSummaries = [];
    if (analyzedDrawings.length > 0) {
      console.log(`Generating summaries for ${analyzedDrawings.length} drawings before recommendations...`);
      
      for (const drawing of analyzedDrawings) {
        try {
          // Set a shorter timeout for summary generation to avoid blocking
          const summaryPromise = Promise.race([
            openaiService.generateDrawingSummary(drawing.imageUrl, child, req.user._id),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Summary generation timeout')), 30000)
            )
          ]);
          
          const summaryResult = await summaryPromise;
          
          drawingSummaries.push({
            drawingId: drawing._id,
            drawingTitle: drawing.title,
            drawingDate: drawing.createdAt,
            summary: summaryResult.summary
          });
          
          console.log(`Successfully generated summary for drawing ${drawing._id}`);
        } catch (summaryError) {
          console.error('Error generating summary for drawing:', drawing._id, summaryError.message);
          
          // Provide a fallback summary based on drawing title and date
          const fallbackSummary = `رسمة بعنوان "${drawing.title}" تم إنشاؤها في ${new Date(drawing.createdAt).toLocaleDateString('ar-EG')}`;
          
          drawingSummaries.push({
            drawingId: drawing._id,
            drawingTitle: drawing.title,
            drawingDate: drawing.createdAt,
            summary: fallbackSummary
          });
          
          // Continue with other drawings even if one fails
        }
      }
      
      console.log(`Generated ${drawingSummaries.length} drawing summaries`);
    }

    // Generate recommendations using OpenAI with drawing summaries included
    const recommendationsResult = await openaiService.generateRecommendations(
      child,
      analyzedDrawings,
      req.user._id,
      count,
      drawingSummaries // Pass summaries to be included in the recommendation request
    );

    console.log('Recommendations generated:', recommendationsResult);

    // Save recommendations to each drawing (if drawings exist)
    const newRecommendations = recommendationsResult.recommendations;
    
    // Get existing recommendations to append to
    const existingDrawingWithRecommendations = await Drawing.findOne({
      child: childId,
      user: req.user._id,
      'analysis.recommendations': { $exists: true, $ne: [] }
    })
    .sort({ createdAt: -1 })
    .select('analysis.recommendations');
    
    let allRecommendations = [];
    if (existingDrawingWithRecommendations && existingDrawingWithRecommendations.analysis.recommendations) {
      // Append new recommendations to existing ones
      allRecommendations = [...existingDrawingWithRecommendations.analysis.recommendations, ...newRecommendations];
    } else {
      // First time generating recommendations
      allRecommendations = newRecommendations;
    }
    
    // Update the most recent drawing with all recommendations and summaries (if drawings exist)
    if (analyzedDrawings.length > 0) {
      const mostRecentDrawing = analyzedDrawings[0];
      
      // Ensure analysis object exists
      if (!mostRecentDrawing.analysis) {
        mostRecentDrawing.analysis = {};
      }
      
      // Validate that recommendations is an array
      if (!Array.isArray(allRecommendations)) {
        console.warn('allRecommendations is not an array, converting to array');
        allRecommendations = [];
      }
      
      mostRecentDrawing.analysis.recommendations = allRecommendations;
      
      // Store drawing summaries as metadata in the recommendations
      mostRecentDrawing.analysis.recommendationMetadata = {
        drawingSummaries: Array.isArray(drawingSummaries) ? drawingSummaries : [],
        generatedAt: new Date(),
        basedOnDrawings: analyzedDrawings.length
      };
      
      try {
        await mostRecentDrawing.save();
        console.log(`Successfully saved recommendations to drawing ${mostRecentDrawing._id}`);
      } catch (saveError) {
        console.error('Error saving recommendations to drawing:', saveError);
        // Don't throw error here, just log it as recommendations were generated successfully
      }
    }

    res.json({
      success: true,
      data: {
        recommendations: allRecommendations,
        newRecommendations: newRecommendations,
        drawingSummaries,
        basedOn: {
          totalImages: allDrawings.length,
          analyzedDrawings: analyzedDrawings.length,
          childName: child.name,
          hasDrawings: analyzedDrawings.length > 0
        }
      },
      message: analyzedDrawings.length > 0 ? 'تم إنشاء التوصيات بنجاح بناءً على الرسومات المحللة' : 'تم إنشاء التوصيات العامة بنجاح'
    });

  } catch (error) {
    console.error('Generate recommendations error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إنشاء التوصيات',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Get recommendations for a child
// @route   GET /api/recommendations/:childId
// @access  Private
router.get('/:childId', protect, async (req, res) => {
  try {
    const childId = req.params.childId;

    // Verify child exists and belongs to user
    const child = await Child.findOne({
      _id: childId,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Get the most recent drawing with recommendations
    const drawingWithRecommendations = await Drawing.findOne({
      child: childId,
      user: req.user._id,
      'analysis.recommendations': { $exists: true, $ne: [] }
    })
    .sort({ createdAt: -1 })
    .select('analysis.recommendations analysis.recommendationMetadata createdAt');

    if (!drawingWithRecommendations) {
      return res.status(404).json({
        success: false,
        message: 'لا توجد توصيات محفوظة لهذا الطفل'
      });
    }

    res.json({
      success: true,
      data: drawingWithRecommendations.analysis.recommendations,
      drawingSummaries: drawingWithRecommendations.analysis.recommendationMetadata?.drawingSummaries || [],
      generatedAt: drawingWithRecommendations.analysis.recommendationMetadata?.generatedAt || drawingWithRecommendations.createdAt
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التوصيات'
    });
  }
});

// @desc    Get all recommendations history for a child
// @route   GET /api/recommendations/:childId/history
// @access  Private
router.get('/:childId/history', protect, async (req, res) => {
  try {
    const childId = req.params.childId;

    // Verify child exists and belongs to user
    const child = await Child.findOne({
      _id: childId,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Get all drawings with recommendations
    const drawingsWithRecommendations = await Drawing.find({
      child: childId,
      user: req.user._id,
      'analysis.recommendations': { $exists: true, $ne: [] }
    })
    .sort({ createdAt: -1 })
    .select('analysis.recommendations analysis.recommendationMetadata createdAt title');

    const history = drawingsWithRecommendations.map(drawing => ({
      drawingId: drawing._id,
      drawingTitle: drawing.title,
      recommendations: drawing.analysis.recommendations,
      drawingSummaries: drawing.analysis.recommendationMetadata?.drawingSummaries || [],
      generatedAt: drawing.analysis.recommendationMetadata?.generatedAt || drawing.createdAt
    }));

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Get recommendations history error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجل التوصيات'
    });
  }
});

// @desc    Delete all recommendations and analysis for a child
// @route   DELETE /api/recommendations/:childId/clear
// @access  Private
router.delete('/:childId/clear', protect, async (req, res) => {
  try {
    const childId = req.params.childId;

    // Verify child exists and belongs to user
    const child = await Child.findOne({
      _id: childId,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Clear all analysis data and recommendations from drawings
    const updateResult = await Drawing.updateMany(
      {
        child: childId,
        user: req.user._id
      },
      {
        $unset: {
          'analysis.recommendations': '',
          'analysis.recommendationMetadata': '',
          'analysis.aiAnalysis': '',
          'analysis.psychologicalState': '',
          'analysis.confidenceScore': '',
          'analysis.analyzedAt': ''
        },
        $set: {
          isAnalyzed: false,
          status: 'pending',
          analyzedAt: null,
          error: null
        }
      }
    );

    console.log(`Cleared analysis data for ${updateResult.modifiedCount} drawings for child ${child.name}`);

    res.json({
      success: true,
      message: `تم حذف جميع التوصيات والتحليلات للطفل ${child.name}`,
      data: {
        clearedDrawings: updateResult.modifiedCount,
        childName: child.name
      }
    });

  } catch (error) {
    console.error('Clear recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف التوصيات والتحليلات'
    });
  }
});

module.exports = router;