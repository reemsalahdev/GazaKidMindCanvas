import React from 'react';
import {
  Grid,
  Card,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const GridView = ({ childrenData }) => {
  const navigate = useNavigate();

  // Helper function to calculate psychological status
  const getChildStatus = (child) => {
    if (!child.emotionalStatus) {
      return { label: 'غير محدد', color: '#9ca3af' };
    }

    const { happiness, sadness, anger, fear, anxiety } = child.emotionalStatus;
    const avgPositive = happiness;
    const avgNegative = (sadness + anger + fear + anxiety) / 4;

    if (avgPositive > 70 && avgNegative < 30) {
      return { label: 'ممتاز', color: '#10b981' };
    } else if (avgPositive > 50 && avgNegative < 50) {
      return { label: 'جيد', color: '#3b82f6' };
    } else if (avgNegative > 60) {
      return { label: 'يحتاج متابعة', color: '#ef4444' };
    } else {
      return { label: 'متوسط', color: '#f59e0b' };
    }
  };

  // Helper function to calculate risk level
  const getRiskLevel = (child) => {
    const status = getChildStatus(child);
    if (status.label === 'يحتاج متابعة') return 'مرتفع';
    if (status.label === 'متوسط') return 'متوسط';
    return 'منخفض';
  };

  return (
    <Box sx={{ p: 3, maxHeight: 480, overflowY: 'auto' }}>
      <Grid container spacing={3}>
        {childrenData.map((child, index) => {
          const childId = child.id;
          const status = getChildStatus(child);
          const riskLevel = getRiskLevel(child);
          
          return (
            <Grid item xs={12} sm={6} md={3} key={childId || index}>
              <Card
                elevation={0}
                sx={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={() => navigate(`/child/${childId}`)}
              >
              {/* Child Image */}
              <Box
                sx={{
                  width: '100%',
                  height: 160,
                  backgroundColor: '#f3f4f6',
                  backgroundImage: child.profileImage
                    ? `url('${child.profileImage}')`
                    : `linear-gradient(135deg, ${child.favoriteColor || '#FF6B6B'} 0%, ${child.favoriteColor || '#FF6B6B'}80 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!child.profileImage && (
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {child.name?.charAt(0)?.toUpperCase() || '؟'}
                  </Typography>
                )}
              </Box>
              
              {/* Card Content */}
              <Box sx={{ p: 2 }}>
                {/* Name and Age */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1f2937' }}>
                    {child.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {child.age} عام
                  </Typography>
                </Box>

                {/* Group Indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: child.groupColor || '#3b82f6'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.688rem' }}>
                    {child.groupName || 'بدون مجموعة'}
                  </Typography>
                </Box>

                {/* Psychological State */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.625rem', display: 'block', mb: 0.25 }}>
                    الحالة النفسية
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1f2937', fontSize: '0.75rem', fontWeight: 500 }}>
                    {status.label}
                  </Typography>
                </Box>

                {/* Danger Level */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.625rem', display: 'block', mb: 0.25 }}>
                    درجة الخطر
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#1f2937', fontSize: '0.75rem', fontWeight: 500 }}>
                      {riskLevel}
                    </Typography>
                    <span style={{ color: status.color, fontSize: '0.5rem' }}>●</span>
                  </Box>
                </Box>

                {/* Status Badge */}
                <Box sx={{ textAlign: 'center' }}>
                  <Chip
                    label={status.label}
                    size="small"
                    sx={{
                      backgroundColor: `${status.color}15`,
                      color: status.color,
                      fontWeight: 600,
                      fontSize: '0.688rem',
                      height: 24,
                      px: 2,
                      borderRadius: 1
                    }}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default GridView;