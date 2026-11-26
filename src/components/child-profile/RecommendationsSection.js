import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { WarningAmberOutlined, AutoAwesome, Refresh, DeleteSweep } from '@mui/icons-material';
import recommendationsService from '../../services/recommendationsService';
import { useChildProfileBase, useRecommendationsContext } from './contexts';

const RecommendationsSection = () => {
  const { childId } = useChildProfileBase();
  const {
    recommendations,
    derivedRecommendations,
    drawingSummaries,
    loadingRecommendations: propLoading,
    loadingExistingRecommendations: propLoadingExisting,
    recommendationsError: propError,
    recommendationsSuccess: propSuccess,
    currentImageIndex: propCurrentImageIndex,
    totalImages: propTotalImages,
    setRecommendationsError,
    setRecommendationsSuccess,
    generateRecommendations: onGenerateRecommendations,
    clearRecommendations: onClearRecommendations
  } = useRecommendationsContext();

  // Always use fresh recommendations from context
  const [recommendationsState, setRecommendationsState] = useState([]);
  const [drawingSummariesState, setDrawingSummariesState] = useState(drawingSummaries || []);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentImageIndexState, setCurrentImageIndexState] = useState(0);
  const [totalImagesState, setTotalImagesState] = useState(0);
  const [detailedError, setDetailedError] = useState('');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);

  // Sync with context recommendations
  useEffect(() => {
    const currentRecommendations = recommendations.length > 0 ? recommendations : derivedRecommendations;
    setRecommendationsState(currentRecommendations || []);
    
    if (drawingSummaries) setDrawingSummariesState(drawingSummaries);
    if (propError) setError(propError);
    if (propSuccess) setSuccess(propSuccess);
    if (typeof propLoading === 'boolean') setLoading(propLoading);
    if (typeof propLoadingExisting === 'boolean') setLoadingExisting(propLoadingExisting);
    if (typeof propCurrentImageIndex === 'number') setCurrentImageIndexState(propCurrentImageIndex);
    if (typeof propTotalImages === 'number') setTotalImagesState(propTotalImages);
  }, [recommendations, derivedRecommendations, drawingSummaries, propError, propSuccess, propLoading, propLoadingExisting, propCurrentImageIndex, propTotalImages]);

  useEffect(() => {
    // Fetch existing recommendations on mount
    fetchExistingRecommendations();

    // Listen for analysis completion events
    const handleAnalysisComplete = () => {
      // Refresh recommendations when a new analysis is completed
      fetchExistingRecommendations();
    };

    window.addEventListener('analysisComplete', handleAnalysisComplete);
    return () => {
      window.removeEventListener('analysisComplete', handleAnalysisComplete);
    };
  }, [childId]);

  const fetchExistingRecommendations = async () => {
    try {
      setLoadingExisting(true);
      setError('');

      const response = await recommendationsService.getRecommendations(childId);
      
      if (response?.success) {
        setRecommendationsState(response.data || []);
        
        // Set drawing summaries if available
        if (response.drawingSummaries) {
          setDrawingSummariesState(response.drawingSummaries);
        }
      }
    } catch (err) {
      console.error('Error fetching existing recommendations:', err);
      // Don't show error if no recommendations exist
      if (err?.response?.status !== 404) {
        setError('فشل في تحميل التوصيات الحالية');
      }
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    // If parent provides the handler, use it
    if (onGenerateRecommendations) {
      return onGenerateRecommendations(4);
    }
    
    // Otherwise, use internal implementation
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setDetailedError('');
      
      // Don't set initial progress state until we know the actual count
      setCurrentImageIndexState(0);
      setTotalImagesState(0);

      // First, make the API call to get the actual data
      const response = await recommendationsService.generateRecommendations(childId, 4);
      
      if (response?.success) {
        const newRecommendations = response.data.recommendations;
        const newDrawingSummaries = response.data.drawingSummaries || [];
        
        // Update total images based on actual response
        const actualTotalImages = response.data.basedOn?.totalImages ||
                                 response.data.basedOn?.analyzedDrawings ||
                                 newDrawingSummaries.length ||
                                 0;
        
        setTotalImagesState(actualTotalImages);
        setCurrentImageIndexState(actualTotalImages); // Set to total since analysis is complete
        
        setRecommendationsState(newRecommendations);
        setDrawingSummariesState(newDrawingSummaries);
        const newRecommendationsCount = response.data.newRecommendations ? response.data.newRecommendations.length : newRecommendations.length;
        setSuccess(`تم إضافة ${newRecommendationsCount} توصيات جديدة بناءً على ${actualTotalImages} رسمة`);
        
        // Refresh to get the saved recommendations
        setTimeout(() => {
          fetchExistingRecommendations();
        }, 1000);
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      console.error('Full error object:', err);
      
      // Set general error message
      setError(err?.response?.data?.message || 'فشل في إنشاء التوصيات');
      
      // Set detailed error information
      let detailedErrorInfo = '';
      if (err?.response?.data) {
        detailedErrorInfo = JSON.stringify(err.response.data, null, 2);
      } else if (err?.message) {
        detailedErrorInfo = err.message;
      } else {
        detailedErrorInfo = 'Unknown error occurred';
      }
      
      setDetailedError(detailedErrorInfo);
    } finally {
      setLoading(false);
      setCurrentImageIndexState(0);
      setTotalImagesState(0);
    }
  };

  const handleClearRecommendations = async () => {
    // If parent provides the handler, use it
    if (onClearRecommendations) {
      setClearDialogOpen(false);
      return onClearRecommendations();
    }
    
    // Otherwise, use internal implementation
    try {
      setClearLoading(true);
      setError('');
      setSuccess('');

      const response = await recommendationsService.clearRecommendations(childId);
      
      if (response?.success) {
        setRecommendationsState([]);
        setDrawingSummariesState([]);
        setSuccess(response.message || 'تم حذف جميع التوصيات والتحليلات بنجاح');
        
        // Refresh recommendations after clearing to ensure sync with server
        setTimeout(() => {
          fetchExistingRecommendations();
        }, 500);
      }
    } catch (err) {
      console.error('Error clearing recommendations:', err);
      setError(err?.response?.data?.message || 'فشل في حذف التوصيات والتحليلات');
    } finally {
      setClearLoading(false);
      setClearDialogOpen(false);
    }
  };

  const handleCloseError = () => {
    setError('');
    if (setRecommendationsError) setRecommendationsError('');
  };

  const handleCloseSuccess = () => {
    setSuccess('');
    if (setRecommendationsSuccess) setRecommendationsSuccess('');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              التوصيات الذكية
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              بناءً على تحليل جميع رسومات الطفل
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
              onClick={handleGenerateRecommendations}
              disabled={loading || loadingExisting || clearLoading}
              sx={{
                backgroundColor: '#3b82f6',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#2563eb'
                }
              }}
            >
              {loading ? (
                totalImagesState > 0 && currentImageIndexState > 0
                  ? `جاري تحليل صورة (${currentImageIndexState} من ${totalImagesState})`
                  : 'جاري الإنشاء...'
              ) : 'إنشاء توصيات ذكية'}
            </Button>
            
            {recommendationsState.length > 0 && (
              <Button
                variant="outlined"
                startIcon={clearLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteSweep />}
                onClick={() => setClearDialogOpen(true)}
                disabled={loading || loadingExisting || clearLoading}
                sx={{
                  borderColor: '#ef4444',
                  color: '#ef4444',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#dc2626',
                    backgroundColor: '#fef2f2'
                  }
                }}
              >
                {clearLoading ? 'جاري الحذف...' : 'حذف الكل'}
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" onClose={handleCloseError} sx={{ mb: 2 }}>
            {error}
            {detailedError && (
              <Box sx={{ mt: 1, p: 1, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  تفاصيل الخطأ:
                  {detailedError}
                </Typography>
              </Box>
            )}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={handleCloseSuccess} sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {loadingExisting ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Display drawing summaries if available */}
            {drawingSummariesState.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  backgroundColor: '#f8fafc'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
                  ملخص الرسومات المحللة
                </Typography>
                <Box>
                  {drawingSummariesState.map((summary, index) => (
                    <Box key={summary.drawingId} sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        <Typography component="span" sx={{ fontWeight: 600, color: '#1f2937' }}>
                          {summary.drawingTitle || `رسمة ${index + 1}`}:
                        </Typography>{' '}
                        {summary.summary}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        {new Date(summary.drawingDate).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Display recommendations */}
            {recommendationsState.map((rec, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2,
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  borderLeft: `4px solid ${rec.type === 'positive' ? '#3b82f6' : rec.type === 'warning' ? '#f59e0b' : '#10b981'}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {rec.type === 'warning' && <WarningAmberOutlined sx={{ color: '#f59e0b', fontSize: 20 }} />}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                      {rec.title}
                    </Typography>
                  </Box>
                  {rec.priority && (
                    <Chip
                      label={
                        rec.priority === 'high' ? 'عالية' :
                        rec.priority === 'medium' ? 'متوسطة' : 'منخفضة'
                      }
                      size="small"
                      color={
                        rec.priority === 'high' ? 'error' :
                        rec.priority === 'medium' ? 'warning' : 'success'
                      }
                    />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                  {rec.description}
                </Typography>
                {rec.drawingTitle && (
                  <Typography variant="caption" sx={{ color: '#9ca3af', mt: 1, display: 'block' }}>
                    من رسمة: {rec.drawingTitle}
                  </Typography>
                )}
              </Paper>
            ))}
          </>
        )}
        {recommendationsState.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid #e5e7eb',
              borderRadius: 1.5,
              textAlign: 'center'
            }}
          >
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
              لا توجد توصيات متاحة حالياً
            </Typography>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              اضغط على "إنشاء توصيات ذكية" لإنشاء توصيات بناءً على تحليل رسومات الطفل
            </Typography>
          </Paper>
        )}

        {/* Clear Confirmation Dialog */}
        <Dialog
          open={clearDialogOpen}
          onClose={() => setClearDialogOpen(false)}
          aria-labelledby="clear-dialog-title"
          aria-describedby="clear-dialog-description"
        >
          <DialogTitle id="clear-dialog-title">
            تأكيد حذف جميع التوصيات والتحليلات
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="clear-dialog-description">
              هل أنت متأكد من أنك تريد حذف جميع التوصيات والتحليلات لهذا الطفل؟
              <br />
              <strong>تحذير:</strong> هذا الإجراء سيحذف جميع التحليلات المحفوظة وسيتطلب إعادة تحليل الرسومات من جديد.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setClearDialogOpen(false)}
              disabled={clearLoading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleClearRecommendations}
              disabled={clearLoading}
              color="error"
              variant="contained"
            >
              {clearLoading ? 'جاري الحذف...' : 'حذف الكل'}
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
};

export default RecommendationsSection;