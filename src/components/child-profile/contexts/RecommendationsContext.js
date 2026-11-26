import React, { createContext, useContext } from 'react';
import { useRecommendations } from '../hooks';
import { useChildProfileBase } from './ChildProfileBaseContext';
import { useDrawings } from './DrawingsContext';

// Context for recommendations management
const RecommendationsContext = createContext(null);

export const RecommendationsProvider = ({ children }) => {
  const { childId } = useChildProfileBase();
  const { drawings } = useDrawings();
  
  // Use custom hook for recommendations
  const {
    recommendations,
    derivedRecommendations,
    drawingSummaries,
    loading: loadingRecommendations,
    loadingExisting: loadingExistingRecommendations,
    error: recommendationsError,
    success: recommendationsSuccess,
    currentImageIndex,
    totalImages,
    setError: setRecommendationsError,
    setSuccess: setRecommendationsSuccess,
    generateRecommendations,
    clearRecommendations
  } = useRecommendations(childId, drawings);
  
  const value = {
    recommendations,
    derivedRecommendations,
    drawingSummaries,
    loadingRecommendations,
    loadingExistingRecommendations,
    recommendationsError,
    recommendationsSuccess,
    currentImageIndex,
    totalImages,
    setRecommendationsError,
    setRecommendationsSuccess,
    generateRecommendations,
    clearRecommendations
  };
  
  return (
    <RecommendationsContext.Provider value={value}>
      {children}
    </RecommendationsContext.Provider>
  );
};

export const useRecommendationsContext = () => {
  const context = useContext(RecommendationsContext);
  if (!context) {
    throw new Error('useRecommendationsContext must be used within RecommendationsProvider');
  }
  return context;
};