import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  IconButton
} from '@mui/material';
import {
  GroupOutlined,
  Add,
  Edit,
  Delete
} from '@mui/icons-material';

const GroupsSection = ({ groups, onAddGroup, onEditGroup, onDeleteGroup }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
          مجموعات الأطفال
        </Typography>
        <Button
          variant="text"
          startIcon={<Add />}
          onClick={onAddGroup}
          sx={{
            color: '#3b82f6',
            textTransform: 'none',
            fontSize: '0.813rem',
            '&:hover': { backgroundColor: 'transparent' }
          }}
        >
          إضافة مجموعة جديدة
        </Button>
      </Box>
      <Grid container spacing={2}>
        {groups.map((group, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              elevation={0}
              sx={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 1.5,
                p: 2,
                textAlign: 'center',
                position: 'relative',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                  borderColor: '#d1d5db'
                },
                '&:hover .group-actions': {
                  opacity: 1
                }
              }}
            >
              {/* Action buttons */}
              <Box
                className="group-actions"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 0.5,
                  opacity: 0,
                  transition: 'opacity 0.2s'
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => onEditGroup(group)}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    '&:hover': {
                      backgroundColor: '#3b82f6',
                      borderColor: '#3b82f6',
                      '& .MuiSvgIcon-root': {
                        color: '#fff'
                      }
                    }
                  }}
                >
                  <Edit sx={{ fontSize: 16, color: '#6b7280' }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => onDeleteGroup(group.id || group._id)}
                  sx={{
                    width: 28,
                    height: 28,
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    '&:hover': {
                      backgroundColor: '#ef4444',
                      borderColor: '#ef4444',
                      '& .MuiSvgIcon-root': {
                        color: '#fff'
                      }
                    }
                  }}
                >
                  <Delete sx={{ fontSize: 16, color: '#6b7280' }} />
                </IconButton>
              </Box>

              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: group.color || '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1
                }}
              >
                <GroupOutlined sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.813rem' }}>
                {group.name}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.688rem' }}>
                {group.count} طفل
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GroupsSection;