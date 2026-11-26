import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Close,
  CloudUpload,
  CalendarMonth,
  AutoAwesome
} from '@mui/icons-material';
import DrawingNotes from './DrawingNotes';
import { useDrawings } from './contexts';

const AddDrawingDrawer = () => {
  const {
    openAddDrawingModal: open,
    setOpenAddDrawingModal: setOpen,
    uploadedFile,
    setUploadedFile,
    drawingDate,
    setDrawingDate,
    drawingTitle,
    setDrawingTitle,
    drawingBehavior,
    setDrawingBehavior,
    handleDrawingUpload
  } = useDrawings();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!uploadedFile) {
      setError('يرجى رفع صورة الرسمة');
      return false;
    }
    if (!drawingDate) {
      setError('يرجى تحديد تاريخ الرسمة');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const drawingData = {
        file: uploadedFile,
        date: drawingDate,
        title: drawingTitle,
        behavior: drawingBehavior
      };

      await handleDrawingUpload(drawingData);
      
      // Reset form after successful submission
      setUploadedFile(null);
      setDrawingDate('');
      setDrawingBehavior('');
    } catch (err) {
      console.error('Error uploading drawing:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء رفع الرسمة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      setOpen(false);
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            إضافة رسمة جديدة
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
            <Close />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Upload Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1.5 }}>
            رفع الرسمة
          </Typography>
          <Box
            component="label"
            sx={{
              border: '2px dashed #e5e7eb',
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: uploadedFile ? '#f0fdf4' : '#fff',
              borderColor: uploadedFile ? '#86efac' : '#e5e7eb',
              cursor: 'pointer',
              display: 'block',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: uploadedFile ? '#4ade80' : '#d1d5db',
                backgroundColor: uploadedFile ? '#dcfce7' : '#f9fafb'
              }
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFile(file);
                  setError('');
                }
              }}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
            <CloudUpload sx={{ 
              fontSize: 40, 
              color: uploadedFile ? '#22c55e' : '#9ca3af', 
              mb: 1 
            }} />
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
              {uploadedFile ? 'تم رفع الملف' : 'استيراد الملفات'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
              {uploadedFile ? uploadedFile.name : 'اسحب وأفلت الملفات هنا أو انقر لرفع'}
            </Typography>
            {uploadedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  حجم الملف: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Date Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
            معلومات الرسمة
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
            تاريخ الرسمة
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={drawingDate}
            onChange={(e) => {
              setDrawingDate(e.target.value);
              setError('');
            }}
            disabled={isSubmitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CalendarMonth sx={{ fontSize: 18, color: '#9ca3af' }} />
                </InputAdornment>
              ),
              inputProps: {
                max: new Date().toISOString().split('T')[0] // Prevent future dates
              }
            }}
            sx={{
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e5e7eb' },
                '&:hover fieldset': { borderColor: '#d1d5db' },
              }
            }}
          />
        </Box>

        {/* Title Field */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
            عنوان الرسمة
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="أدخل عنوان الرسمة"
            value={drawingTitle}
            onChange={(e) => {
              setDrawingTitle(e.target.value);
              setError('');
            }}
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e5e7eb' },
                '&:hover fieldset': { borderColor: '#d1d5db' },
              }
            }}
          />
        </Box>

        {/* Drawing Notes Component */}
        <DrawingNotes
          drawingBehavior={drawingBehavior}
          setDrawingBehavior={setDrawingBehavior}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              color: '#6b7280',
              borderColor: '#e5e7eb',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={isSubmitting || !uploadedFile || !drawingDate || !drawingTitle || drawingTitle.trim() === ''}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
            sx={{
              backgroundColor: '#3b82f6',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: 'none',
              },
              '&:disabled': {
                backgroundColor: '#e5e7eb',
                color: '#9ca3af'
              }
            }}
          >
            {isSubmitting ? 'جاري الرفع...' : 'رفع وتحليل'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddDrawingDrawer;