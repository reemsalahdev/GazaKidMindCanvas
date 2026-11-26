import React, { createContext, useContext, useEffect } from 'react';
import { useEmotionalStatus } from '../hooks';
import { useChildProfileBase } from './ChildProfileBaseContext';

// Context for emotional status management
const EmotionalStatusContext = createContext(null);

export const EmotionalStatusProvider = ({ children }) => {
  const { childId, childData } = useChildProfileBase();
  
  // Use custom hook for emotional status
  const { 
    emotionalStatus, 
    updateEmotionalStatus 
  } = useEmotionalStatus(childId, childData?.emotionalStatus);
  
  // Update emotional status when child data loads
  useEffect(() => {
    if (childData?.emotionalStatus && emotionalStatus) {
      const newStatus = {
        anxiety: childData.emotionalStatus.anxiety || 50,
        sadness: childData.emotionalStatus.sadness || 50,
        happiness: childData.emotionalStatus.happiness || 50,
        anger: childData.emotionalStatus.anger || 50,
        fear: childData.emotionalStatus.fear || 50
      };
      // Only update if different
      if (JSON.stringify(newStatus) !== JSON.stringify(emotionalStatus)) {
        updateEmotionalStatus(newStatus);
      }
    }
  }, [childData]);
  
  const value = {
    emotionalStatus,
    updateEmotionalStatus
  };
  
  return (
    <EmotionalStatusContext.Provider value={value}>
      {children}
    </EmotionalStatusContext.Provider>
  );
};

export const useEmotionalStatusContext = () => {
  const context = useContext(EmotionalStatusContext);
  if (!context) {
    throw new Error('useEmotionalStatusContext must be used within EmotionalStatusProvider');
  }
  return context;
};