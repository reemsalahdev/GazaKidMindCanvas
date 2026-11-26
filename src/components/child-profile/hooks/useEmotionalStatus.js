import { useState, useCallback } from 'react';
import childrenService from '../../../services/childrenService';

const useEmotionalStatus = (childId, initialStatus = null) => {
  const [emotionalStatus, setEmotionalStatus] = useState(
    initialStatus || {
      anxiety: 50,
      sadness: 50,
      happiness: 50,
      anger: 50,
      fear: 50
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateEmotionalStatus = useCallback(async (newStatus) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate childId before making API call
      if (!childId || childId === 'undefined') {
        console.error('Invalid child ID for emotional status update');
        setLoading(false);
        return;
      }
      
      const response = await childrenService.updateEmotionalStatus(childId, newStatus);
      
      if (response.success) {
        setEmotionalStatus(newStatus);
        return response;
      }
    } catch (err) {
      console.error('Error updating emotional status:', err);
      setError('فشل في تحديث الحالة العاطفية');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [childId]);

  const resetEmotionalStatus = useCallback(() => {
    setEmotionalStatus({
      anxiety: 50,
      sadness: 50,
      happiness: 50,
      anger: 50,
      fear: 50
    });
  }, []);

  return {
    emotionalStatus,
    setEmotionalStatus,
    updateEmotionalStatus,
    resetEmotionalStatus,
    loading,
    error
  };
};

export default useEmotionalStatus;