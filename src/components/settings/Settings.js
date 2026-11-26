import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Button,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Save, Api } from '@mui/icons-material';
import DashboardLayout from '../DashboardLayout';
import AccountSettingsTab from './AccountSettingsTab';
import GeneralInfoTab from './GeneralInfoTab';
import userService from '../../services/userService';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Account Settings state
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // General Information state
  const [institutionName, setInstitutionName] = useState('');
  const [averageChildren, setAverageChildren] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(null);

  // OpenAI Settings state
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasOpenAIConfig, setHasOpenAIConfig] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchOpenAIStatus();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const result = await userService.getProfile();
      if (result.success && result.user) {
        setEmail(result.user.email || '');
        setInstitutionName(result.user.institutionName || '');
        setAverageChildren(result.user.averageChildren || '');
        setLicenseNumber(result.user.licenseNumber || '');
        setAddress(result.user.address || '');
        setContactNumber(result.user.contactNumber || '');
      } else {
        setError('فشل في تحميل بيانات المستخدم');
      }
    } catch (err) {
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const fetchOpenAIStatus = async () => {
    try {
      const result = await userService.getOpenAIConfigStatus();
      if (result.success) {
        setHasOpenAIConfig(result.data.hasBaseUrl && result.data.hasApiKey);
        // Don't set the actual base URL value if it exists, just show placeholder
        if (result.data.hasBaseUrl) {
          setOpenaiBaseUrl('');
        }
      }
    } catch (err) {
      console.error('Error fetching OpenAI config status:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSaveAccountSettings = async () => {
    setError('');
    if (!currentPassword) {
      setError('يرجى إدخال كلمة المرور الحالية');
      return;
    }

    const accountData = {
      currentPassword,
      ...(email !== '' && { email }),
      ...(newPassword && { newPassword })
    };

    try {
      const result = await userService.updateAccount(accountData);
      if (result.success) {
        setSuccessMessage('تم تحديث إعدادات الحساب بنجاح');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setError(result.message || 'فشل في تحديث إعدادات الحساب');
      }
    } catch (err) {
      setError('حدث خطأ في تحديث البيانات');
    }
  };

  const handleSaveGeneralInfo = async () => {
    setError('');
    const profileData = {
      institutionName,
      averageChildren: averageChildren ? parseInt(averageChildren) : 0,
      licenseNumber,
      address,
      contactNumber
    };

    try {
      const result = await userService.updateProfile(profileData);
      if (result.success) {
        setSuccessMessage('تم تحديث المعلومات العامة بنجاح');
      } else {
        setError(result.message || 'فشل في تحديث المعلومات');
      }
    } catch (err) {
      setError('حدث خطأ في تحديث البيانات');
    }
  };

  const handleSaveOpenAISettings = async () => {
    setError('');
    
    if (!openaiBaseUrl || !openaiApiKey) {
      setError('يرجى إدخال رابط API ومفتاح API');
      return;
    }

    try {
      const result = await userService.updateOpenAIConfig({
        baseUrl: openaiBaseUrl,
        apiKey: openaiApiKey
      });
      
      if (result.success) {
        setSuccessMessage('تم تحديث إعدادات OpenAI بنجاح');
        setHasOpenAIConfig(true);
        setOpenaiApiKey(''); // Clear API key from state for security
        setOpenaiBaseUrl(''); // Clear base URL from state for security
      } else {
        setError(result.message || 'فشل في تحديث إعدادات OpenAI');
      }
    } catch (err) {
      setError('حدث خطأ في تحديث البيانات');
    }
  };

  const handleCancel = () => {
    // Reset fields or navigate back
    setEmail('');
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedLogo({
          file: file,
          preview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateLogo = () => {
    // Handle logo update logic
    if (selectedLogo) {
      console.log('Updating logo...', selectedLogo.file);
    }
  };

  const handleDeleteLogo = () => {
    setSelectedLogo(null);
    // Reset the file input
    const fileInput = document.getElementById('logo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3, pr: '270px' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 600, color: '#1f2937' }}>
          الإعدادات
        </Typography>

        <Box sx={{ maxWidth: 'md', mx: 'auto' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f8fafc' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="settings tabs"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#6b7280',
                    '&.Mui-selected': {
                      color: '#1f2937',
                      fontWeight: 600,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#3b82f6',
                  },
                }}
              >
                <Tab label="المعلومات العامة" />
                <Tab label="إعدادات الحساب" />
                <Tab label="إعدادات OpenAI" icon={<Api sx={{ fontSize: 18, ml: 1 }} />} iconPosition="end" />
              </Tabs>
            </Box>

            {/* General Information Tab */}
            {activeTab === 0 && (
              <GeneralInfoTab
                selectedLogo={selectedLogo}
                institutionName={institutionName}
                setInstitutionName={setInstitutionName}
                averageChildren={averageChildren}
                setAverageChildren={setAverageChildren}
                licenseNumber={licenseNumber}
                setLicenseNumber={setLicenseNumber}
                address={address}
                setAddress={setAddress}
                contactNumber={contactNumber}
                setContactNumber={setContactNumber}
                onLogoUpload={handleLogoUpload}
                onLogoUpdate={handleUpdateLogo}
                onLogoDelete={handleDeleteLogo}
                onSave={handleSaveGeneralInfo}
              />
            )}

            {/* Account Settings Tab */}
            {activeTab === 1 && (
              <AccountSettingsTab
                email={email}
                setEmail={setEmail}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                onCancel={handleCancel}
                onSave={handleSaveAccountSettings}
              />
            )}

            {/* OpenAI Settings Tab */}
            {activeTab === 2 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  إعدادات OpenAI
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  قم بإعداد مفتاح API الخاص بـ OpenAI لتمكين تحليل رسومات الأطفال بالذكاء الاصطناعي
                </Typography>

                {hasOpenAIConfig && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    تم تكوين إعدادات OpenAI بنجاح
                  </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    رابط API الأساسي
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="https://api.openai.com/v1"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    sx={{ mb: 3 }}
                  />

                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                    مفتاح API
                  </Typography>
                  <TextField
                    fullWidth
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowApiKey(!showApiKey)}
                            edge="end"
                          >
                            {showApiKey ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    يتم تخزين رابط API ومفتاح API بشكل آمن ولن يتم عرضهما مرة أخرى بعد الحفظ
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveOpenAISettings}
                    sx={{
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    }}
                  >
                    حفظ الإعدادات
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    للحصول على مفتاح API:
                  </Typography>
                  <ol style={{ margin: '8px 0', paddingRight: '20px' }}>
                    <li>قم بزيارة <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></li>
                    <li>قم بتسجيل الدخول أو إنشاء حساب</li>
                    <li>انتقل إلى قسم API Keys</li>
                    <li>قم بإنشاء مفتاح جديد</li>
                  </ol>
                </Alert>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Settings;