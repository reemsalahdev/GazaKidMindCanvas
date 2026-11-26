import { useState, useEffect, useCallback } from 'react';
import childrenService from '../../../services/childrenService';
import drawingsService from '../../../services/drawingsService';

const useChildDrawings = (childId, limit = 20) => {
  const [drawings, setDrawings] = useState([]);
  const [drawingStats, setDrawingStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChildDrawings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate childId before making API call
      if (!childId || childId === 'undefined') {
        setLoading(false);
        return;
      }
      
      // Fetch drawings
      const drawingsResponse = await childrenService.getChildDrawings(childId, { limit });
      
      if (drawingsResponse.success) {
        setDrawings(drawingsResponse.data);
      }

      // Fetch drawing statistics
      const statsResponse = await drawingsService.getChildDrawingStats(childId);
      if (statsResponse.success) {
        setDrawingStats(statsResponse.data);
      }
    } catch (err) {
      console.error('Error fetching drawings:', err);
      setError('فشل في تحميل الرسومات');
    } finally {
      setLoading(false);
    }
  }, [childId, limit]);

  // Fetch data when childId or limit changes
  useEffect(() => {
    if (childId) {
      fetchChildDrawings();
    }
  }, [childId, fetchChildDrawings]);

  const refetch = () => {
    return fetchChildDrawings();
  };

  // Upload a new drawing
  const uploadDrawing = useCallback(async (drawingData) => {
    try {
      const uploadData = {
        image: drawingData.file,
        childId: childId,
        title: drawingData.title || 'رسمة جديدة',
        description: drawingData.behavior || '',
        context: {
          environment: 'clinic',
          sessionNotes: drawingData.behavior || ''
        }
      };

      const response = await drawingsService.uploadDrawing(uploadData);
      
      if (response.success) {
        // Refresh drawings after upload
        await fetchChildDrawings();
        return response;
      }
    } catch (err) {
      console.error('Error uploading drawing:', err);
      throw err;
    }
  }, [childId, fetchChildDrawings]);

  return {
    drawings,
    drawingStats,
    loading,
    error,
    refetch,
    uploadDrawing
  };
};

export default useChildDrawings;