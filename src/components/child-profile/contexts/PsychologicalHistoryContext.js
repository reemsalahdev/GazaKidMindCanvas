import React, { createContext, useContext } from 'react';
import { usePsychologicalHistory } from '../hooks';
import { useDrawings } from './DrawingsContext';

// Context for psychological history
const PsychologicalHistoryContext = createContext(null);

export const PsychologicalHistoryProvider = ({ children }) => {
  const { drawings } = useDrawings();
  
  // Use custom hook for psychological history
  const { psychologicalHistory } = usePsychologicalHistory(drawings);
  
  const value = {
    psychologicalHistory
  };
  
  return (
    <PsychologicalHistoryContext.Provider value={value}>
      {children}
    </PsychologicalHistoryContext.Provider>
  );
};

export const usePsychologicalHistoryContext = () => {
  const context = useContext(PsychologicalHistoryContext);
  if (!context) {
    throw new Error('usePsychologicalHistoryContext must be used within PsychologicalHistoryProvider');
  }
  return context;
};