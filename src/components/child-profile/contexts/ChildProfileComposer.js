import React from 'react';
import {
  ChildProfileBaseProvider,
  DrawingsProvider,
  EmotionalStatusProvider,
  RecommendationsProvider,
  PsychologicalHistoryProvider
} from './index';

// Composer provider that wraps all child profile providers
export const ChildProfileComposer = ({ children }) => {
  return (
    <ChildProfileBaseProvider>
      <DrawingsProvider>
        <EmotionalStatusProvider>
          <RecommendationsProvider>
            <PsychologicalHistoryProvider>
              {children}
            </PsychologicalHistoryProvider>
          </RecommendationsProvider>
        </EmotionalStatusProvider>
      </DrawingsProvider>
    </ChildProfileBaseProvider>
  );
};

// Helper function to create a provider component with selective contexts
export const createSelectiveProvider = (contexts) => {
  return ({ children }) => {
    // Build nested providers based on selected contexts
    let result = children;
    
    // Reverse the order to maintain proper nesting
    const providers = [...contexts].reverse();
    
    providers.forEach(Provider => {
      result = <Provider>{result}</Provider>;
    });
    
    return result;
  };
};

// Export pre-configured selective providers for common use cases
export const DrawingManagementProvider = createSelectiveProvider([
  ChildProfileBaseProvider,
  DrawingsProvider
]);

export const PsychologicalAnalysisProvider = createSelectiveProvider([
  ChildProfileBaseProvider,
  DrawingsProvider,
  EmotionalStatusProvider,
  PsychologicalHistoryProvider
]);

export const RecommendationsManagementProvider = createSelectiveProvider([
  ChildProfileBaseProvider,
  DrawingsProvider,
  RecommendationsProvider
]);