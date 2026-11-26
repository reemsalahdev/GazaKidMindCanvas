import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Avatar } from '@mui/material';
import CircularProgress from './CircularProgress';

const MentalHealthIndicators = ({ data }) => {
  // Calculate aggregated emotional states based on backend data
  const calculateIndicators = () => {
    if (!data || !data.indicators) {
      return [
        { status: 'جاري التحميل...', value: '0', color: '#9ca3af', percentage: 0 }
      ];
    }

    const avgIndicators = data.indicators;
    const overallAverage = Object.values(avgIndicators).reduce((sum, val) => sum + val, 0) / 5;

    // Calculate children in each category
    const childrenNeedingAttention = data.childrenNeedingAttention || [];
    const positiveCount = Math.round(overallAverage);
    const negativeCount = childrenNeedingAttention.length;
    const neutralCount = Math.max(0, 100 - positiveCount - negativeCount);

    return [
      { 
        status: 'حالة عاطفية إيجابية - تحسن ملحوظ متقدم واستقرار', 
        value: positiveCount.toString(), 
        color: '#10b981',
        percentage: positiveCount,
        details: `متوسط الثقة بالنفس: ${Math.round(avgIndicators.selfConfidence || 0)}%`
      },
      { 
        status: 'حالة محايدة - لا توجد إشارات واضحة على تحسن أو تدهور', 
        value: neutralCount.toString(), 
        color: '#9ca3af',
        percentage: neutralCount,
        details: `متوسط التفاعل الاجتماعي: ${Math.round(avgIndicators.socialInteraction || 0)}%`
      },
      { 
        status: 'حالة عاطفية سلبية - تُظهر مؤشرات قلق، حزن أو اضطراب عاطفي', 
        value: negativeCount.toString(), 
        color: '#ef4444',
        percentage: Math.min(100, negativeCount * 10), // Scale for visualization
        details: `${negativeCount} طفل يحتاجون للمتابعة`
      }
    ];
  };

  const indicators = calculateIndicators();
  const childrenNeedingAttention = data?.childrenNeedingAttention || [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 1.5
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, fontSize: '1.125rem', color: '#1f2937' }}>
        مؤشر التحليل النفسي
      </Typography>
      
      <Grid container spacing={4}>
        {indicators.map((indicator, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress value={indicator.value} color={indicator.color} />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  textAlign: 'center',
                  lineHeight: 1.6,
                  maxWidth: 280
                }}
              >
                {indicator.status}
              </Typography>
              {indicator.details && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontSize: '0.688rem', 
                    color: '#9ca3af', 
                    textAlign: 'center'
                  }}
                >
                  {indicator.details}
                </Typography>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Show children needing attention */}
      {childrenNeedingAttention.length > 0 && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #f3f4f6' }}>
          <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontSize: '0.875rem' }}>
            أطفال يحتاجون للمتابعة:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {childrenNeedingAttention.slice(0, 5).map((child) => (
              <Chip
                key={child.id}
                avatar={
                  child.profileImage ? 
                    <Avatar src={child.profileImage} /> : 
                    <Avatar>{child.name.charAt(0)}</Avatar>
                }
                label={`${child.name} - ${child.lowestIndicator.name}: ${child.lowestIndicator.value}%`}
                size="small"
                variant="outlined"
                color="error"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
            {childrenNeedingAttention.length > 5 && (
              <Chip
                label={`+${childrenNeedingAttention.length - 5} آخرين`}
                size="small"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        gap: 0.5, 
        mt: 3,
        pt: 2,
        borderTop: '1px solid #f3f4f6'
      }}>
        <Box>
          {data && data.indicators && (
            <Typography variant="caption" sx={{ color: '#9ca3af', fontSize: '0.688rem' }}>
              المؤشرات النفسية: الثقة {Math.round(data.indicators.selfConfidence)}% | 
              التفاعل {Math.round(data.indicators.socialInteraction)}% | 
              التعبير {Math.round(data.indicators.emotionalExpression)}%
            </Typography>
          )}
        </Box>
        <Typography
          variant="caption"
          sx={{ color: '#3b82f6', cursor: 'pointer', fontSize: '0.688rem' }}
        >
          تحديث البيانات
        </Typography>
      </Box>
    </Paper>
  );
};

export default MentalHealthIndicators;