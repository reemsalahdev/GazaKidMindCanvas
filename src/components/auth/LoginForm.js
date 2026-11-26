import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginFormFields from './LoginFormFields';
import authService from '../../services/authService';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    // Add temporary debugging
    console.log('handleLogin called');
    
    // Prevent default FIRST thing to ensure no refresh
    if (e && e.preventDefault) {
      e.preventDefault();
      console.log('preventDefault called');
    }
    
    // Early return if already loading
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        // Check if there are specific validation errors
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map(err => err.msg || err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(result.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
        }
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forget-password');
  };

  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4
    }}>
      <Box
        sx={{
          p: 4,
          maxWidth: 380,
          width: '100%',
          mt: 8
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            تسجيل الدخول إلى حسابك
          </Typography>
          <Typography variant="body2" color="text.secondary">
            مرحباً بك، سجل الدخول للمتابعة
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'right' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate>
          <LoginFormFields
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onForgotPassword={handleForgotPassword}
            disabled={loading}
          />
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LoginForm;