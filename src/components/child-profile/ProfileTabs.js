import React from 'react';
import { Paper, Tabs, Tab, Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useChildProfileBase, useDrawings } from './contexts';
import ProfileInfo from './ProfileInfo';
import RecentDrawings from './RecentDrawings';
import PsychologicalHistory from './PsychologicalHistory';
import RecommendationsSection from './RecommendationsSection';

const ProfileTabs = () => {
  const { activeTab, handleTabChange } = useChildProfileBase();
  const {
    drawings,
    loadingDrawings,
    selectedDrawing,
    setSelectedDrawing,
    openDrawingModal,
    setOpenDrawingModal
  } = useDrawings();

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // نظرة عامة
        return (
          <Grid container spacing={3}>
            {/* Right Column - Profile Info */}
            <Grid item xs={12} md={4}>
              <ProfileInfo />
            </Grid>

            {/* Left Column - Content */}
            <Grid item xs={12} md={8}>
              <RecentDrawings />
              <PsychologicalHistory />
            </Grid>
          </Grid>
        );

      case 1: // سجل الرسومات
        return (
          <Box>
            {loadingDrawings ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {drawings.map((drawing) => (
                  <Grid item xs={12} sm={6} md={4} key={drawing._id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #e5e7eb',
                        borderRadius: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {drawing.imageUrl ? (
                          <img
                            src={drawing.imageUrl}
                            alt={drawing.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              const img = e.target;
                              // Try alternate legacy path once if drawings folder path fails
                              const hasTriedFallback = img.dataset.fallbackApplied === 'true';
                              const isDrawingsPath = img.src.includes('/uploads/drawings/');
                              if (!hasTriedFallback && isDrawingsPath) {
                                img.dataset.fallbackApplied = 'true';
                                img.src = img.src.replace('/uploads/drawings/', '/uploads/');
                                return;
                              }
                              // Show fallback UI
                              img.style.display = 'none';
                              if (img.nextSibling) {
                                img.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <Box
                          sx={{
                            display: drawing.imageUrl ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            color: '#9ca3af'
                          }}
                        >
                          <Typography variant="caption">لا توجد صورة</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                        {drawing.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(drawing.createdAt).toLocaleDateString('ar-EG')}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 2: // التوصيات الذكية
        return <RecommendationsSection />;

      default:
        return null;
    }
  };
  
  return (
    <>
      <Paper elevation={0} sx={{ mb: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#3b82f6',
                fontWeight: 600
              }
            }
          }}
        >
          <Tab label="نظرة عامة" />
          <Tab label="سجل الرسومات" />
          <Tab label="التوصيات الذكية" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {renderTabContent()}
    </>
  );
};

export default ProfileTabs;