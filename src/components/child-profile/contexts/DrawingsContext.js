import React, { createContext, useContext, useState, useEffect } from 'react';
import { useChildDrawings } from '../hooks';
import { useChildProfileBase } from './ChildProfileBaseContext';

// Context for drawings-related state and operations
const DrawingsContext = createContext(null);

export const DrawingsProvider = ({ children }) => {
  const { childId, activeTab, location, navigate } = useChildProfileBase();
  
  // Drawing modals state
  const [openAddDrawingModal, setOpenAddDrawingModal] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState(null);
  const [openDrawingModal, setOpenDrawingModal] = useState(false);
  
  // Drawing form state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [drawingDate, setDrawingDate] = useState('');
  const [drawingTitle, setDrawingTitle] = useState('');
  const [drawingBehavior, setDrawingBehavior] = useState('');
  
  // Use custom hook for drawings
  const { 
    drawings, 
    drawingStats, 
    loading: loadingDrawings, 
    uploadDrawing,
    refetch: refetchDrawings 
  } = useChildDrawings(childId, activeTab === 0 ? 3 : 20);
  
  // Check navigation state for add drawing modal
  useEffect(() => {
    if (location.state?.openAddDrawing) {
      setOpenAddDrawingModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  
  const handleDrawingUpload = async (drawingData) => {
    try {
      const response = await uploadDrawing(drawingData);
      
      if (response.success) {
        setOpenAddDrawingModal(false);
        
        // Reset form
        setUploadedFile(null);
        setDrawingDate('');
        setDrawingTitle('');
        setDrawingBehavior('');
      }
    } catch (err) {
      console.error('Error uploading drawing:', err);
      // Handle error (show notification)
    }
  };
  
  const value = {
    // Drawing modal state
    openAddDrawingModal,
    setOpenAddDrawingModal,
    selectedDrawing,
    setSelectedDrawing,
    openDrawingModal,
    setOpenDrawingModal,
    
    // Drawing form state
    uploadedFile,
    setUploadedFile,
    drawingDate,
    setDrawingDate,
    drawingTitle,
    setDrawingTitle,
    drawingBehavior,
    setDrawingBehavior,
    
    // Drawing data and operations
    drawings,
    drawingStats,
    loadingDrawings,
    uploadDrawing,
    refetchDrawings,
    handleDrawingUpload
  };
  
  return (
    <DrawingsContext.Provider value={value}>
      {children}
    </DrawingsContext.Provider>
  );
};

export const useDrawings = () => {
  const context = useContext(DrawingsContext);
  if (!context) {
    throw new Error('useDrawings must be used within DrawingsProvider');
  }
  return context;
};