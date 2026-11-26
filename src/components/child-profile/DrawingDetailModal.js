import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, BrokenImage } from '@mui/icons-material';
import drawingsService from '../../services/drawingsService';

const DrawingDetailModal = ({ open, onClose, drawing, onAnalyzed }) => {
  const [currentDrawing, setCurrentDrawing] = useState(drawing || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && drawing?._id) {
      // Fetch fresh drawing data when modal opens
      fetchDrawingDetails(drawing._id);
    } else {
      setCurrentDrawing(drawing || null);
      setError('');
      setSuccess('');
      setAnalyzing(false);
      setLoading(false);
    }
  }, [drawing, open]);

  const fetchDrawingDetails = async (drawingId) => {
    try {
      setLoading(true);
      setError('');
      const response = await drawingsService.getDrawing(drawingId);
      if (response?.success) {
        setCurrentDrawing(response.data);
      }
    } catch (err) {
      console.error('Error fetching drawing details:', err);
      setError('فشل في تحميل تفاصيل الرسمة');
    } finally {
      setLoading(false);
    }
  };

  if (!currentDrawing) return null;

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  const handleAnalyze = async () => {
    try {
      setError('');
      setSuccess('');
      setAnalyzing(true);

      const res = await drawingsService.analyzeDrawing(currentDrawing._id);
      if (res?.success) {
        const updated = res.data;
        setCurrentDrawing(updated);
        setSuccess('تم تحليل الرسمة بنجاح');
        if (onAnalyzed) onAnalyzed(updated);
        
        // Emit custom event to update dashboard
        window.dispatchEvent(new Event('analysisComplete'));
      } else {
        setError(res?.message || 'فشل تحليل الرسمة');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'خطأ في تحليل الرسمة');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">{currentDrawing.title}</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Image Section */}
            <Box
            sx={{
              width: '100%',
              height: 400,
              backgroundColor: '#f3f4f6',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentDrawing.imageUrl && (
              <img
                src={currentDrawing.imageUrl}
                alt={currentDrawing.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={handleImageError}
              />
            )}
            <Box
              sx={{
                display: currentDrawing.imageUrl ? 'none' : 'flex',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af'
              }}
            >
              <BrokenImage sx={{ fontSize: 60, mb: 2 }} />
              <Typography>الصورة غير متوفرة</Typography>
            </Box>
          </Box>

          {/* Info Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              تاريخ الرسمة:{' '}
              {new Date(currentDrawing.createdAt).toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>

            {currentDrawing.description && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {currentDrawing.description}
              </Typography>
            )}

            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f3f4f6', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                حالة التحليل: {currentDrawing.isAnalyzed ? 'تم التحليل' : 'غير محللة'}
              </Typography>
              {currentDrawing.isAnalyzed && currentDrawing.analysis?.aiAnalysis?.overallAssessment && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  النتيجة العامة: {currentDrawing.analysis.aiAnalysis.overallAssessment}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            {currentDrawing.isAnalyzed ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Navigate to full analysis view
                  const childId = typeof currentDrawing.child === 'object' ?
                    currentDrawing.child._id : currentDrawing.child;
                  window.location.href = `/child/${childId}/analysis/${currentDrawing._id}`;
                }}
              >
                عرض التحليل الكامل
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyze}
                disabled={analyzing}
                startIcon={analyzing ? <CircularProgress size={18} /> : null}
              >
                {analyzing ? 'جاري التحليل...' : 'تحليل الرسمة'}
              </Button>
            )}
            <Button variant="outlined" onClick={onClose}>
              إغلاق
            </Button>
          </Stack>
        </Stack>
      )}
      </DialogContent>
    </Dialog>
  );
};

export default DrawingDetailModal;