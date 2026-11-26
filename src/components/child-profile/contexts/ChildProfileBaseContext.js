import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useChildData } from '../hooks';

// Context for basic child profile data, navigation and tabs
const ChildProfileBaseContext = createContext(null);

export const ChildProfileBaseProvider = ({ children }) => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Tab management
  const [activeTab, setActiveTab] = useState(0);
  
  // Use custom hook for child data
  const { childData, loading: loadingChild, error: childError } = useChildData(childId);
  
  // Check navigation state for tab changes
  useEffect(() => {
    if (location.state?.activeTab !== undefined) {
      setActiveTab(location.state.activeTab);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format child data for ProfileInfo component
  const formattedChildData = childData ? {
    name: childData.name,
    birthDate: childData.birthDate || `${new Date().getFullYear() - (childData.age || 0)}-01-01`,
    age: childData.age ? `${childData.age} سنة` : 'غير محدد',
    gender: childData.gender === 'male' ? 'ذكر' : 'أنثى',
    registrationDate: new Date(childData.createdAt).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }),
    supervisor: childData.group || 'غير محدد',
    school: childData.additionalInfo?.school || 'غير محدد',
    class: childData.additionalInfo?.class || 'غير محدد',
    familyBackground: childData.additionalInfo?.familyBackground || 'غير محدد'
  } : null;
  
  const value = {
    // Navigation and params
    childId,
    navigate,
    location,
    
    // Child data
    childData,
    formattedChildData,
    loadingChild,
    childError,
    
    // Tab management
    activeTab,
    setActiveTab,
    handleTabChange
  };
  
  return (
    <ChildProfileBaseContext.Provider value={value}>
      {children}
    </ChildProfileBaseContext.Provider>
  );
};

export const useChildProfileBase = () => {
  const context = useContext(ChildProfileBaseContext);
  if (!context) {
    throw new Error('useChildProfileBase must be used within ChildProfileBaseProvider');
  }
  return context;
};