import { useState, useEffect, useCallback } from 'react';
import childrenService from '../../../services/childrenService';

const useChildData = (childId) => {
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChildData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate childId before making API call
      if (!childId || childId === 'undefined') {
        setError('معرف الطفل غير صالح');
        setLoading(false);
        return;
      }
      
      const response = await childrenService.getChild(childId);
      
      if (response.success) {
        setChildData(response.data);
      }
    } catch (err) {
      console.error('Error fetching child data:', err);
      setError('فشل في تحميل بيانات الطفل');
    } finally {
      setLoading(false);
    }
  }, [childId]);

  // Fetch data when childId changes
  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId, fetchChildData]);

  const refetch = () => {
    return fetchChildData();
  };

  return {
    childData,
    loading,
    error,
    refetch
  };
};

export default useChildData;