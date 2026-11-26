import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  MoreVert,
  Edit,
  CalendarMonth,
  PsychologyOutlined
} from '@mui/icons-material';
import { useChildProfileBase, useDrawings } from './contexts';

const ProfileInfo = () => {
  const { formattedChildData } = useChildProfileBase();
  const { setOpenAddDrawingModal } = useDrawings();
  
  // If no data, return null
  if (!formattedChildData) {
    return null;
  }
  
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 1.5, mb: 3 }}>
      {/* Profile Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: '#e5e7eb',
              color: '#6b7280',
              fontSize: '1.5rem'
            }}
          >
            {formattedChildData.name[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
              {formattedChildData.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarMonth sx={{ fontSize: 16 }} />
              {formattedChildData.birthDate} {formattedChildData.age && ` · ${formattedChildData.age}`} {formattedChildData.gender && ` · ${formattedChildData.gender}`}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small">
          <MoreVert sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Registration Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: '#6b7280' }}>
          تاريخ التسجيل
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
          {formattedChildData.registrationDate}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Additional Info */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            إدارة الأطفال
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
            {formattedChildData.supervisor}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            المدرسة
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
            {formattedChildData.school}
          </Typography>
        </Box>
        {formattedChildData.class && (
          <Box>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              الصف الدراسي
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#1f2937' }}>
              {formattedChildData.class}
            </Typography>
          </Box>
        )}
        <Box>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            الحالة النفسية
          </Typography>
          <Chip
            label="ملف"
            size="small"
            icon={<PsychologyOutlined sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: '#dbeafe',
              color: '#2563eb',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: '#2563eb',
                marginLeft: '-4px',
                marginRight: '1px'
              }
            }}
          />
        </Box>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<Edit />}
        onClick={() => setOpenAddDrawingModal(true)}
        sx={{
          mt: 3,
          textTransform: 'none',
          borderColor: '#e5e7eb',
          color: '#374151',
          gap: 1,
          '&:hover': {
            borderColor: '#d1d5db',
            backgroundColor: '#f9fafb'
          }
        }}
      >
        إضافة رسمة جديدة
      </Button>
    </Paper>
  );
};

export default ProfileInfo;