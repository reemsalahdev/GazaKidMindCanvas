import React from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import DashboardLayout from '../DashboardLayout';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import AddDrawingDrawer from './AddDrawingDrawer';
import DrawingDetailModal from './DrawingDetailModal';

// Import the context provider and hook
import { ChildProfileComposer, useChildProfileBase, useDrawings } from './contexts';

// Inner component that uses the context
const ChildProfileContent = () => {
  const {
    childData,
    loadingChild,
    childError
  } = useChildProfileBase();
  
  const {
    openDrawingModal,
    setOpenDrawingModal,
    selectedDrawing,
    setSelectedDrawing,
    refetchDrawings
  } = useDrawings();

  if (loadingChild) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (childError || !childData) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            {childError || 'الطفل غير موجود'}
          </Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pr: '270px' }}>
        <ProfileHeader />
        <ProfileTabs />
      </Box>

      <AddDrawingDrawer />

      <DrawingDetailModal
        open={openDrawingModal}
        onClose={() => {
          setOpenDrawingModal(false);
          setSelectedDrawing(null);
        }}
        drawing={selectedDrawing}
        onAnalyzed={(updated) => {
          setSelectedDrawing(updated);
          // Refresh lists and stats to reflect analysis
          refetchDrawings();
        }}
      />
    </DashboardLayout>
  );
};

// Main component that provides the context
const ChildProfile = () => {
  return (
    <ChildProfileComposer>
      <ChildProfileContent />
    </ChildProfileComposer>
  );
};

export default ChildProfile;