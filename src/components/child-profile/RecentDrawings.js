import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, BrokenImage } from '@mui/icons-material';
import { useChildProfileBase, useDrawings } from './contexts';

const RecentDrawings = () => {
  const navigate = useNavigate();
  const { childId } = useChildProfileBase();
  const { drawings, loadingDrawings } = useDrawings();
  
  // Get only the first 3 drawings
  const recentDrawings = drawings.slice(0, 3).map(drawing => ({
    id: drawing._id,
    date: new Date(drawing.createdAt).toLocaleDateString('ar-EG'),
    image: drawing.imageUrl,
    childId: drawing.child
  }));

  const handleImageError = (e) => {
    // Hide the broken image and show fallback
    e.target.style.display = 'none';
    const fallback = e.target.nextSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  if (loadingDrawings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
        آخر 3 رسومات
      </Typography>
      <Grid container spacing={2}>
        {recentDrawings.length === 0 ? (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: '#6b7280',
                backgroundColor: '#f3f4f6',
                borderRadius: 1
              }}
            >
              <Typography>لا توجد رسومات حتى الآن</Typography>
            </Box>
          </Grid>
        ) : (
          recentDrawings.map((drawing, index) => (
            <Grid item xs={4} key={drawing.id || index}>
              <Card
                elevation={0}
                sx={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 1.5,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    height: 120,
                    backgroundColor: '#f3f4f6',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {drawing.image && (
                    <img
                      src={drawing.image}
                      alt={`رسمة ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={handleImageError}
                    />
                  )}
                  <Box
                    sx={{
                      display: !drawing.image ? 'flex' : 'none',
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af'
                    }}
                  >
                    <BrokenImage sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="caption">الصورة غير متوفرة</Typography>
                  </Box>
                </Box>
                <Box sx={{ p: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {drawing.date}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default RecentDrawings;