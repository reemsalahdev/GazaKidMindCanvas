import { useMemo } from 'react';

const usePsychologicalHistory = (drawings) => {
  const psychologicalHistory = useMemo(() => {
    if (!drawings || drawings.length === 0) return [];

    return drawings
      .filter(drawing => {
        const isAnalyzed = drawing.isAnalyzed && drawing.analysis;
        return isAnalyzed;
      })
      .map(drawing => {
        const psychState = drawing.analysis?.psychologicalState || {};
        const aiAnalysis = drawing.analysis?.aiAnalysis || {};
        
        // Determine dominant emotional state
        const emotions = {
          happiness: psychState.happiness || 50,
          sadness: psychState.sadness || 50,
          anxiety: psychState.anxiety || 50,
          anger: psychState.anger || 50,
          fear: psychState.fear || 50
        };
        
        const dominantEmotion = Object.entries(emotions)
          .reduce((max, [emotion, value]) => 
            value > max.value ? { emotion, value } : max, 
            { emotion: 'normal', value: 0 }
          );
        
        // Map emotions to Arabic labels and colors
        const emotionMap = {
          happiness: { label: 'سعيد 😊', color: '#34d399' },
          sadness: { label: 'حزين 😢', color: '#3b82f6' },
          anxiety: { label: 'قلق 😰', color: '#f59e0b' },
          anger: { label: 'غاضب 😠', color: '#ef4444' },
          fear: { label: 'خائف 😨', color: '#8b5cf6' },
          normal: { label: 'عادي 😐', color: '#9ca3af' }
        };
        
        const status = dominantEmotion.value > 60 ?
          emotionMap[dominantEmotion.emotion] :
          emotionMap.normal;
        
        return {
          date: new Date(drawing.createdAt).toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          }),
          status: status.label,
          color: status.color,
          analysis: aiAnalysis.overallAssessment ||
                   aiAnalysis.emotionalIndicators ||
                   'تم تحليل الرسمة ولكن لا توجد تفاصيل متاحة',
          drawingTitle: drawing.title
        };
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
  }, [drawings]);

  return {
    psychologicalHistory,
    hasHistory: psychologicalHistory.length > 0
  };
};

export default usePsychologicalHistory;