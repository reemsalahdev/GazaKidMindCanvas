const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.mkdir(path.join(uploadsDir, 'children'), { recursive: true });
    await fs.mkdir(path.join(uploadsDir, 'drawings'), { recursive: true });
  }
};

// Configure storage for different upload types
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureUploadsDir();

    // Build a robust matcher from baseUrl and route path
    const base = req.baseUrl || '';
    const routePath = (req.route && req.route.path) ? req.route.path : '';
    const fullPath = `${base}${routePath}`;

    let uploadPath;
    // Children profile images
    if (fullPath.includes('/children') && fullPath.includes('profile-image')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'children');
    // Any endpoint under /drawings router
    } else if (fullPath.includes('/drawings')) {
      uploadPath = path.join(__dirname, '..', 'uploads', 'drawings');
    } else {
      uploadPath = path.join(__dirname, '..', 'uploads');
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for image uploads
const imageFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('يُسمح فقط بملفات الصور (JPEG, JPG, PNG, GIF, WEBP)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت'
      });
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'عدد الملفات المرفوعة كثير جداً'
      });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'اسم حقل الملف غير صحيح'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'خطأ في رفع الملف'
    });
  }
  next();
};

// Helper function to get file URL
const getFileUrl = (req, filename, type = 'drawings') => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${type}/${filename}`;
};

// Helper function to delete file
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

module.exports = {
  upload,
  handleMulterError,
  getFileUrl,
  deleteFile,
  ensureUploadsDir
};