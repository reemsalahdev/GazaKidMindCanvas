import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Menu,
  MenuItem
} from '@mui/material';
import { MoreHoriz, Delete, Edit } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TableView = ({ childrenData, onDeleteChild, onEditChild, loading }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedChild, setSelectedChild] = React.useState(null);

  const handleMenuOpen = (event, child) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChild(child);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChild(null);
  };

  const handleDelete = () => {
    if (selectedChild && onDeleteChild) {
      onDeleteChild(selectedChild.id);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedChild && onEditChild) {
      onEditChild(selectedChild);
    }
    handleMenuClose();
  };

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

  // Format date
  const formatDate = (date) => {
    if (!date) return 'لا يوجد';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('ar-EG');
  };

  if (loading && (!childrenData || childrenData.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!childrenData || childrenData.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          لا توجد بيانات أطفال
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer sx={{ maxHeight: 480 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>
                <MoreHoriz sx={{ fontSize: 16 }} />
              </TableCell>
              <TableCell sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>الاسم الكامل</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>العمر</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>الحالة النفسية</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>درجة الخطر</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>الجنس</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>اخر تحليل</TableCell>
              <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', fontWeight: 500, py: 1.5, backgroundColor: '#f9fafb' }}>عدد الرسومات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {childrenData.map((child, index) => {
              const status = getChildStatus(child);
              const riskLevel = getRiskLevel(child);
              
              const childId = child.id;
              
              return (
                <TableRow
                  key={childId || index}
                  sx={{
                    '&:hover': { backgroundColor: '#f9fafb', cursor: 'pointer' },
                    borderBottom: index === childrenData.length - 1 ? 'none' : '1px solid #f3f4f6'
                  }}
                  onClick={() => navigate(`/child/${childId}`)}
                >
                  <TableCell align="center" sx={{ py: 1.25 }}>
                    <IconButton 
                      size="small" 
                      sx={{ p: 0.5 }}
                      onClick={(e) => handleMenuOpen(e, child)}
                    >
                      <MoreHoriz sx={{ fontSize: 16, color: '#9ca3af' }} />
                    </IconButton>
                  </TableCell>
                  <TableCell sx={{ py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {child.profileImage ? (
                        <Avatar 
                          src={child.profileImage} 
                          sx={{ width: 22, height: 22 }}
                        />
                      ) : (
                        <Avatar sx={{ 
                          width: 22, 
                          height: 22, 
                          bgcolor: child.favoriteColor || '#e5e7eb', 
                          fontSize: '0.563rem' 
                        }}>
                          {child.name.charAt(0)}
                        </Avatar>
                      )}
                      <Typography variant="body2" sx={{ fontSize: '0.688rem', fontWeight: 500 }}>
                        {child.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.688rem', py: 1.25 }}>{child.age} سنة</TableCell>
                  <TableCell align="center" sx={{ py: 1.25 }}>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        backgroundColor: `${status.color}15`,
                        color: status.color,
                        fontWeight: 600,
                        fontSize: '0.563rem',
                        height: 18
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.688rem', py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      {riskLevel}
                      <span style={{ color: status.color, fontSize: '0.5rem' }}>●</span>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.688rem', py: 1.25 }}>
                    {child.gender === 'male' ? 'ذكر' : 'أنثى'}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.688rem', color: '#6b7280', py: 1.25 }}>
                    {formatDate(child.lastDrawingDate)}
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.688rem', py: 1.25 }}>
                    {child.drawingCount || 0}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ fontSize: 16, mr: 1 }} />
          تعديل
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: '#ef4444' }}>
          <Delete sx={{ fontSize: 16, mr: 1 }} />
          حذف
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableView;