const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleMulterError, getFileUrl } = require('../middleware/upload');
const Child = require('../models/Child');
const Drawing = require('../models/Drawing');
const Group = require('../models/Group');

// @desc    Get all children for a user
// @route   GET /api/children
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      group = 'all',
      gender = 'all',
      status = 'all',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const userId = req.user._id;
    const query = { user: userId, isActive: true };

    // Apply filters
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (group !== 'all') {
      query.group = group;
    }

    if (gender !== 'all' && gender !== 'الجنس') {
      // تحويل قيم الجنس من العربية إلى الإنجليزية
      if (gender === 'ذكر') {
        query.gender = 'male';
      } else if (gender === 'أنثى') {
        query.gender = 'female';
      } else {
        query.gender = gender;
      }
    }

    // Apply status filter based on emotional indicators
    if (status !== 'all' && status !== 'الحالة') {
      if (status === 'مستقرة' || status === 'مستقر') {
        // الحالة المستقرة: عندما تكون المشاعر الإيجابية أعلى من السلبية
        query['$expr'] = {
          $gt: [
            '$emotionalStatus.happiness',
            { $max: ['$emotionalStatus.sadness', '$emotionalStatus.anger', '$emotionalStatus.fear', '$emotionalStatus.anxiety'] }
          ]
        };
      } else if (status === 'قلق') {
        // حالة القلق: عندما تكون المشاعر السلبية أعلى
        query['$expr'] = {
          $gt: [
            { $max: ['$emotionalStatus.sadness', '$emotionalStatus.anger', '$emotionalStatus.fear', '$emotionalStatus.anxiety'] },
            '$emotionalStatus.happiness'
          ]
        };
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortOptions = {};
    
    if (sortBy === 'درجة الخطر') {
      // Sort by risk level based on psychological indicators average
      // نحسب درجة الخطر بناءً على متوسط المؤشرات النفسية
      // كلما انخفضت المؤشرات النفسية، زادت درجة الخطر
      const children = await Child.find(query);
      const childrenWithRisk = children.map(child => {
        const indicators = child.psychologicalIndicators;
        const avgIndicator = (
          (indicators.selfConfidence || 50) +
          (indicators.socialInteraction || 50) +
          (indicators.emotionalExpression || 50) +
          (indicators.adaptability || 50) +
          (indicators.cognitiveAbility || 50)
        ) / 5;
        
        // درجة الخطر = 100 - متوسط المؤشرات
        const riskLevel = 100 - avgIndicator;
        
        return {
          ...child.toObject(),
          calculatedRiskLevel: riskLevel
        };
      });
      
      // ترتيب حسب درجة الخطر
      childrenWithRisk.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.calculatedRiskLevel - b.calculatedRiskLevel;
        }
        return b.calculatedRiskLevel - a.calculatedRiskLevel;
      });
      
      // تطبيق التصفح
      const skip = (pageNum - 1) * limitNum;
      const paginatedChildren = childrenWithRisk.slice(skip, skip + limitNum);
      const total = childrenWithRisk.length;
      
      // معالجة البيانات وإضافة الإحصائيات
      const childrenWithStats = await Promise.all(
        paginatedChildren.map(async (child) => {
          const drawingCount = await Drawing.countDocuments({
            child: child._id
          });
          const lastDrawing = await Drawing.findOne({
            child: child._id
          }).sort('-createdAt').select('createdAt');

          // حساب الحالة العامة
          let overallStatus = 'مستقر';
          const emotionalValues = child.emotionalStatus;
          if (emotionalValues) {
            const avgEmotions = {
              positive: emotionalValues.happiness || 50,
              negative: Math.max(
                emotionalValues.sadness || 50,
                emotionalValues.anger || 50,
                emotionalValues.fear || 50,
                emotionalValues.anxiety || 50
              )
            };
            
            if (avgEmotions.positive > 70) {
              overallStatus = 'سعيد';
            } else if (avgEmotions.negative > 70) {
              overallStatus = 'قلق';
            } else if (emotionalValues.sadness > 70) {
              overallStatus = 'حزين';
            } else if (emotionalValues.anger > 70) {
              overallStatus = 'غاضب';
            }
          }

          return {
            ...child,
            drawingCount,
            lastDrawingDate: lastDrawing?.createdAt || null,
            emotionalStatus: {
              ...child.emotionalStatus,
              overall: overallStatus
            }
          };
        })
      );
      
      // إرجاع النتيجة مباشرة
      return res.json({
        success: true,
        data: childrenWithStats,
        pagination: {
          current: pageNum,
          pageSize: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      });
    } else if (sortBy === 'الأحدث') {
      sortOptions['createdAt'] = -1;
    } else if (sortBy === 'الأقدم') {
      sortOptions['createdAt'] = 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Get children with pagination
    const children = await Child.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip);

    // Get total count
    const total = await Child.countDocuments(query);

    // Get drawing count for each child
    const childrenWithStats = await Promise.all(
      children.map(async (child) => {
        const drawingCount = await Drawing.countDocuments({ 
          child: child._id 
        });
        const lastDrawing = await Drawing.findOne({ 
          child: child._id 
        }).sort('-createdAt').select('createdAt');

        // حساب الحالة العامة بناءً على المؤشرات العاطفية
        let overallStatus = 'مستقر';
        const emotionalValues = child.emotionalStatus;
        if (emotionalValues) {
          const avgEmotions = {
            positive: emotionalValues.happiness || 50,
            negative: Math.max(
              emotionalValues.sadness || 50,
              emotionalValues.anger || 50,
              emotionalValues.fear || 50,
              emotionalValues.anxiety || 50
            )
          };
          
          if (avgEmotions.positive > 70) {
            overallStatus = 'سعيد';
          } else if (avgEmotions.negative > 70) {
            overallStatus = 'قلق';
          } else if (emotionalValues.sadness > 70) {
            overallStatus = 'حزين';
          } else if (emotionalValues.anger > 70) {
            overallStatus = 'غاضب';
          }
        }

        return {
          ...child.toObject(),
          drawingCount,
          lastDrawingDate: lastDrawing?.createdAt || null,
          emotionalStatus: {
            ...child.emotionalStatus,
            overall: overallStatus
          }
        };
      })
    );

    res.json({
      success: true,
      data: childrenWithStats,
      pagination: {
        current: pageNum,
        pageSize: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get children error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الأطفال'
    });
  }
});

// @desc    Get single child
// @route   GET /api/children/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Get additional stats
    const drawingCount = await Drawing.countDocuments({ child: child._id });
    const analyzedDrawings = await Drawing.countDocuments({ 
      child: child._id, 
      isAnalyzed: true 
    });

    res.json({
      success: true,
      data: {
        ...child.toObject(),
        statistics: {
          totalDrawings: drawingCount,
          analyzedDrawings
        }
      }
    });
  } catch (error) {
    console.error('Get child error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات الطفل'
    });
  }
});

// @desc    Create new child
// @route   POST /api/children
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const childData = {
      ...req.body,
      user: req.user._id
    };

    const child = await Child.create(childData);

    res.status(201).json({
      success: true,
      data: child,
      message: 'تم إضافة الطفل بنجاح'
    });
  } catch (error) {
    console.error('Create child error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطأ في إضافة الطفل'
    });
  }
});

// @desc    Update child
// @route   PUT /api/children/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined && key !== 'user') {
        child[key] = req.body[key];
      }
    });

    await child.save();

    res.json({
      success: true,
      data: child,
      message: 'تم تحديث بيانات الطفل بنجاح'
    });
  } catch (error) {
    console.error('Update child error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'خطأ في تحديث بيانات الطفل'
    });
  }
});

// @desc    Delete child (soft delete)
// @route   DELETE /api/children/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Soft delete
    child.isActive = false;
    await child.save();

    res.json({
      success: true,
      message: 'تم حذف الطفل بنجاح'
    });
  } catch (error) {
    console.error('Delete child error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الطفل'
    });
  }
});

// @desc    Get all groups
// @route   GET /api/children/groups/list
// @access  Private
router.get('/groups/list', protect, async (req, res) => {
  try {
    const groups = await Group.find({
      user: req.user._id,
      isActive: true
    }).populate('children', '_id');

    // Get count for each group
    const groupsWithCount = groups.map(group => ({
      _id: group._id,
      name: group.name,
      color: group.color,
      count: group.children.length
    }));

    res.json({
      success: true,
      data: groupsWithCount
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المجموعات'
    });
  }
});

// @desc    Create new group
// @route   POST /api/children/groups
// @access  Private
router.post('/groups', protect, async (req, res) => {
  try {
    const { name, color, selectedChildren } = req.body;

    // Check if group already exists
    const existingGroup = await Group.findOne({
      user: req.user._id,
      name: name,
      isActive: true
    });

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: 'المجموعة موجودة بالفعل'
      });
    }

    // Create new group
    const group = await Group.create({
      user: req.user._id,
      name,
      color,
      children: selectedChildren || []
    });

    // Update children to belong to this group
    if (selectedChildren && selectedChildren.length > 0) {
      await Child.updateMany(
        {
          _id: { $in: selectedChildren },
          user: req.user._id
        },
        { group: name }
      );
    }

    res.status(201).json({
      success: true,
      data: group,
      message: 'تم إنشاء المجموعة بنجاح'
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في إنشاء المجموعة'
    });
  }
});

// @desc    Update group
// @route   PUT /api/children/groups/:id
// @access  Private
router.put('/groups/:id', protect, async (req, res) => {
  try {
    const { name, color, selectedChildren } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'المجموعة غير موجودة'
      });
    }

    const oldName = group.name;

    // Update group
    group.name = name;
    group.color = color;
    group.children = selectedChildren || [];
    await group.save();

    // Update children's group name if it changed
    if (oldName !== name) {
      await Child.updateMany(
        {
          user: req.user._id,
          group: oldName
        },
        { group: name }
      );
    }

    // Update selected children
    if (selectedChildren && selectedChildren.length > 0) {
      // Remove group from all children first
      await Child.updateMany(
        {
          user: req.user._id,
          group: name
        },
        { group: '' }
      );
      
      // Then add group to selected children
      await Child.updateMany(
        {
          _id: { $in: selectedChildren },
          user: req.user._id
        },
        { group: name }
      );
    }

    res.json({
      success: true,
      data: group,
      message: 'تم تحديث المجموعة بنجاح'
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث المجموعة'
    });
  }
});

// @desc    Delete group
// @route   DELETE /api/children/groups/:id
// @access  Private
router.delete('/groups/:id', protect, async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'المجموعة غير موجودة'
      });
    }

    // Remove group from all children
    await Child.updateMany(
      {
        user: req.user._id,
        group: group.name
      },
      { group: '' }
    );

    // Soft delete group
    group.isActive = false;
    await group.save();

    res.json({
      success: true,
      message: 'تم حذف المجموعة بنجاح'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المجموعة'
    });
  }
});

// @desc    Update emotional status
// @route   PUT /api/children/:id/emotional-status
// @access  Private
router.put('/:id/emotional-status', protect, async (req, res) => {
  try {
    const { emotionalStatus } = req.body;
    
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Update emotional status
    if (emotionalStatus) {
      Object.keys(emotionalStatus).forEach(key => {
        if (emotionalStatus[key] !== undefined) {
          child.emotionalStatus[key] = emotionalStatus[key];
        }
      });
    }

    await child.save();

    res.json({
      success: true,
      data: child.emotionalStatus,
      message: 'تم تحديث الحالة العاطفية'
    });
  } catch (error) {
    console.error('Update emotional status error:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث الحالة العاطفية'
    });
  }
});

// @desc    Update psychological indicators
// @route   PUT /api/children/:id/psychological-indicators
// @access  Private
router.put('/:id/psychological-indicators', protect, async (req, res) => {
  try {
    const { psychologicalIndicators } = req.body;
    
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Update psychological indicators
    if (psychologicalIndicators) {
      Object.keys(psychologicalIndicators).forEach(key => {
        if (psychologicalIndicators[key] !== undefined) {
          child.psychologicalIndicators[key] = psychologicalIndicators[key];
        }
      });
    }

    await child.save();

    res.json({
      success: true,
      data: child.psychologicalIndicators,
      message: 'تم تحديث المؤشرات النفسية'
    });
  } catch (error) {
    console.error('Update psychological indicators error:', error);
    res.status(400).json({
      success: false,
      message: 'خطأ في تحديث المؤشرات النفسية'
    });
  }
});

// @desc    Get child's drawings
// @route   GET /api/children/:id/drawings
// @access  Private
router.get('/:id/drawings', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    
    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    const query = { child: req.params.id };
    if (status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const drawings = await Drawing.find(query)
      .sort('-createdAt')
      .limit(limitNum)
      .skip(skip)
      .select('title imageUrl status isAnalyzed createdAt analysis');

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
    console.error('Get child drawings error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب رسومات الطفل'
    });
  }
});

// @desc    Upload profile image for child
// @route   POST /api/children/:id/profile-image
// @access  Private
router.post('/:id/profile-image', protect, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي صورة'
      });
    }

    const child = await Child.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'الطفل غير موجود'
      });
    }

    // Generate the image URL
    const imageUrl = getFileUrl(req, req.file.filename, 'children');

    // Update child's profile image
    child.profileImage = imageUrl;
    await child.save();

    res.json({
      success: true,
      data: {
        profileImage: imageUrl
      },
      message: 'تم رفع الصورة الشخصية بنجاح'
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الصورة الشخصية'
    });
  }
});

module.exports = router;