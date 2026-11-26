import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useChildProfileBase } from './contexts';

const ProfileHeader = () => {
  const navigate = useNavigate();
  const { childData } = useChildProfileBase();

  return (
    <Box sx={{ mb: 3 }}>
      <Button
        onClick={() => navigate('/children')}
        sx={{ mb: 2, color: '#6b7280', '&:hover': { backgroundColor: 'transparent' } }}
      >
        ← عودة
      </Button>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
        إدارة الأطفال · {childData?.name || ''}
      </Typography>
    </Box>
  );
};

export default ProfileHeader;