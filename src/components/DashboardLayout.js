import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  HomeOutlined,
  GroupOutlined,
  TipsAndUpdatesOutlined,
  PersonAddAltOutlined,
  AddPhotoAlternateOutlined,
  SettingsOutlined,
  LogoutOutlined,
  ExpandMoreOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'الرئيسية', icon: <HomeOutlined />, path: '/dashboard' },
    { text: 'إدارة الأطفال', icon: <GroupOutlined />, path: '/children' },
    { text: 'التوصيات المقترحة', icon: <TipsAndUpdatesOutlined />, path: '/children', state: { openRecommendations: true } },
    { divider: true },
    { text: 'إضافة طفل جديد', icon: <PersonAddAltOutlined />, path: '/children', state: { openAddChild: true } },
    { text: 'رفع رسمة جديدة', icon: <AddPhotoAlternateOutlined />, path: '/children', state: { openUploadDrawing: true } },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>

      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          backgroundColor: '#fff',
          borderLeft: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          right: 0,
          top: 0
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              component="img"
              src="/Auth/Asessts/Logo.png"
              alt="GazaKidMindCanvas"
              sx={{ height: 40, width: 'auto' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#818cf8' }}>
              {currentUser?.institutionName?.charAt(0) || 'م'}
            </Avatar>
            <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={handleUserMenuOpen}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937', fontSize: '0.875rem' }}>
                {currentUser?.institutionName || 'المستخدم'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {currentUser?.email || 'email@example.com'}
                <ExpandMoreOutlined fontSize="small" />
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { handleUserMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <SettingsOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>الإعدادات</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              <ListItemText>تسجيل الخروج</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, py: 2 }}>
          <List sx={{ px: 1 }}>
            {menuItems.map((item, index) => {
              if (item.divider) {
                return <Divider key={index} sx={{ my: 1 }} />;
              }
              return (
                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => navigate(item.path, { state: item.state })}
                    sx={{
                      borderRadius: 1.5,
                      backgroundColor: location.pathname === item.path && !item.state ? '#f3f4f6' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                      },
                      py: 1.5
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: location.pathname === item.path ? '#818cf8' : '#6b7280'
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        color: location.pathname === item.path ? '#1f2937' : '#4b5563'
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* Settings at bottom */}
        <Box sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/settings')}
              sx={{
                borderRadius: 1.5,
                backgroundColor: location.pathname === '/settings' ? '#f3f4f6' : 'transparent',
                '&:hover': {
                  backgroundColor: '#f3f4f6',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#6b7280' }}>
                <SettingsOutlined />
              </ListItemIcon>
              <ListItemText
                primary="الإعدادات"
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  color: '#4b5563'
                }}
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;