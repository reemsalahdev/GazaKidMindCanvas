import React from 'react';
import { Box, Typography } from '@mui/material';

const ChartLegend = ({ selectedChildren = [], availableChildren = [] }) => {
  // Get selected children details
  const getSelectedChildrenInfo = () => {
    return selectedChildren.map(childId => {
      const child = availableChildren.find(c => c._id === childId);
      return child || null;
    }).filter(Boolean);
  };

  const selectedChildrenInfo = getSelectedChildrenInfo();

  // Define colors for each child (up to 5 colors)
  const childColors = ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'];

  if (selectedChildrenInfo.length === 0) {
    return null;
  }

  return (
    <>
      {/* Legend below chart */}
      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
        {selectedChildrenInfo.map((child, index) => (
          <Box key={child._id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 2, backgroundColor: childColors[index % childColors.length] }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#374151' }}>
              {child.name}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Dynamic notification box - only show if there's recent activity */}
      {selectedChildrenInfo.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 1.5,
            backgroundColor: '#fef3c7',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#78350f' }}>
            📊 ملخص الحالة
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.75rem' }}>
              عدد الأطفال المحددين: {selectedChildrenInfo.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#92400e', fontSize: '0.75rem' }}>
              • يتم عرض بيانات التحليل النفسي بناءً على الرسومات المحللة
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

export default ChartLegend;