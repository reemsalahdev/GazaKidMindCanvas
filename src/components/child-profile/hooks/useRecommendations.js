import { useState, useEffect, useCallback, useMemo } from 'react';
import recommendationsService from '../../../services/recommendationsService';

const useRecommendations = (childId, drawings) => {
  const [recommendations, setRecommendations] = useState([]);
  const [drawingSummaries, setDrawingSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalImages, setTotalImages] = useState(0);

  // Derive recommendations from analyzed drawings
  const derivedRecommendations = useMemo(() => {
    if (!drawings || drawings.length === 0) return [];
    
    return drawings
      .filter(drawing => drawing.isAnalyzed && drawing.analysis?.recommendations?.length > 0)
      .flatMap(drawing => drawing.analysis.recommendations)
      .map(rec => ({
        title: rec.title,
        description: rec.description,
        type: rec.type || (rec.priority === 'high' ? 'warning' : rec.priority === 'low' ? 'positive' : 'action'),
        priority: rec.priority,
        category: rec.category
      }));
  }, [drawings]);

  // Fetch existing recommendations
  const fetchExistingRecommendations = useCallback(async () => {
    try {
      setLoadingExisting(true);
      setError('');

      const response = await recommendationsService.getRecommendations(childId);
      
      if (response?.success) {
        setRecommendations(response.data || []);
        
        if (response.drawingSummaries) {
          setDrawingSummaries(response.drawingSummaries);
        }
      }
    } catch (err) {
      console.error('Error fetching existing recommendations:', err);
      if (err?.response?.status !== 404) {
        setError('فشل في تحميل التوصيات الحالية');
      }
    } finally {
      setLoadingExisting(false);
    }
  }, [childId]);

  // Generate new recommendations
  const generateRecommendations = useCallback(async (maxImages = 4) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setCurrentImageIndex(0);
      setTotalImages(0);

      const response = await recommendationsService.generateRecommendations(childId, maxImages);
      
      if (response?.success) {
        const newRecommendations = response.data.recommendations;
        const newDrawingSummaries = response.data.drawingSummaries || [];
        
        const actualTotalImages = response.data.basedOn?.totalImages ||
                                 response.data.basedOn?.analyzedDrawings ||
                                 newDrawingSummaries.length ||
                                 0;
        
        setTotalImages(actualTotalImages);
        setCurrentImageIndex(actualTotalImages);
        
        setRecommendations(newRecommendations);
        setDrawingSummaries(newDrawingSummaries);
        
        const newRecommendationsCount = response.data.newRecommendations ? 
          response.data.newRecommendations.length : newRecommendations.length;
        
        setSuccess(`تم إضافة ${newRecommendationsCount} توصيات جديدة بناءً على ${actualTotalImages} رسمة`);
        
        // Refresh to get the saved recommendations
        setTimeout(() => {
          fetchExistingRecommendations();
        }, 1000);
        
        return response;
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err?.response?.data?.message || 'فشل في إنشاء التوصيات');
      throw err;
    } finally {
      setLoading(false);
      setCurrentImageIndex(0);
      setTotalImages(0);
    }
  }, [childId, fetchExistingRecommendations]);

  // Clear recommendations
  const clearRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await recommendationsService.clearRecommendations(childId);
      
      if (response?.success) {
        setRecommendations([]);
        setDrawingSummaries([]);
        setSuccess(response.message || 'تم حذف جميع التوصيات والتحليلات بنجاح');
        return response;
      }
    } catch (err) {
      console.error('Error clearing recommendations:', err);
      setError(err?.response?.data?.message || 'فشل في حذف التوصيات والتحليلات');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Fetch existing recommendations on mount
  useEffect(() => {
    if (childId) {
      fetchExistingRecommendations();
    }
  }, [childId, fetchExistingRecommendations]);

  // Listen for analysis completion events
  useEffect(() => {
    const handleAnalysisComplete = () => {
      fetchExistingRecommendations();
    };

    window.addEventListener('analysisComplete', handleAnalysisComplete);
    return () => {
      window.removeEventListener('analysisComplete', handleAnalysisComplete);
    };
  }, [fetchExistingRecommendations]);

  return {
    recommendations,
    derivedRecommendations,
    drawingSummaries,
    loading,
    loadingExisting,
    error,
    success,
    currentImageIndex,
    totalImages,
    setError,
    setSuccess,
    fetchExistingRecommendations,
    generateRecommendations,
    clearRecommendations
  };
};

export default useRecommendations;