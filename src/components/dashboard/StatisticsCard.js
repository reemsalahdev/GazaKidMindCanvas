import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography
} from '@mui/material';

const StatisticsCard = ({ title, value, change, icon, color }) => {
  // Format percentage to avoid unnecessary decimals and long floating point numbers
  const formatPercentage = (percent) => {
    if (!percent || Math.abs(percent) < 0.01) return '0';
    
    // If it's a whole number, don't show decimals
    if (percent % 1 === 0) {
      return Math.abs(percent).toString();
    }
    
    // Otherwise, show up to 1 decimal place
    return Math.abs(percent).toFixed(1);
  };

  const formattedChange = formatPercentage(change);
  const showPercentage = formattedChange !== '0';

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 1.5,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}15`,
            color: color,
            mb: 2
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.813rem' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#1f2937' }}>
            {value}
          </Typography>
          {showPercentage && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: change > 0 ? '#10b981' : '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              {change > 0 ? (
                <span style={{ fontSize: '0.875rem' }}>↑</span>
              ) : (
                <span style={{ fontSize: '0.875rem' }}>↓</span>
              )}
              <Typography variant="caption" sx={{ fontWeight: 500, ml: 0.25 }}>
                {formattedChange}%
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatisticsCard;