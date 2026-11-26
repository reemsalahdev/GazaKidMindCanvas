import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';

const WelcomeSection = () => {
  const navigate = useNavigate();
  const [institutionName, setInstitutionName] = useState('');
  
  useEffect(() => {
    // Fetch institution name on component mount
    const fetchInstitutionName = async () => {
      // First try to get from localStorage for immediate display
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.institutionName) {
        setInstitutionName(storedUser.institutionName);
      }
      
      // Then fetch fresh data from the server
      const result = await userService.getProfile();
      if (result.success && result.user?.institutionName) {
        setInstitutionName(result.user.institutionName);
      }
    };
    
    fetchInstitutionName();
  }, []);
  
  return (
    <>
      {/* Welcome Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
          مرحباً بك من جديد {institutionName || 'مؤسستك'}! 🔥
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          إليك لمحة سريعة عن حالة الأطفال – لأن كل متابعة تشرق
          <span style={{ color: '#10b981' }}>✓</span>
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="text"
          startIcon={<CalendarToday sx={{ fontSize: 16 }} />}
          sx={{
            color: '#6b7280',
            textTransform: 'none',
            fontSize: '0.875rem',
            gap: 1,
            '&:hover': { backgroundColor: '#f3f4f6' }
          }}
        >
          ملخص الأسبوع
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/children', { state: { openAddChild: true } })}
          sx={{
            color: '#818cf8',
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: '#f3f4f613' }
          }}
        >
          إضافة طفل جديد +
        </Button>
        <Button
          variant="text"
          onClick={() => navigate('/children', { state: { openUploadDrawing: true } })}
          sx={{
            color: '#818cf8',
            textTransform: 'none',
            fontSize: '0.875rem',
            '&:hover': { backgroundColor: '#f3f4f613' }
          }}
        >
          رفع رسمة جديدة +
        </Button>
      </Box>
    </>
  );
};

export default WelcomeSection;