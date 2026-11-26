import React, { useState } from 'react';
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Button,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import PersonalImageSection from './PersonalImageSection';
import ChildInfoForm from './ChildInfoForm';
import AdditionalInfoSection from './AdditionalInfoSection';
import ColorPicker from './ColorPicker';

const AddChildDrawer = ({ open, onClose, onSubmit, groups = [], childToEdit = null }) => {
  const initialValues = {
    name: '',
    age: '',
    gender: '',
    group: 'الافتراضي',
    favoriteColor: '#FF6B6B',
    currentStatus: '',
    initialNotes: '',
    birthDate: '',
    additionalInfo: {
      medicalHistory: '',
      familyBackground: '',
      previousAssessments: '',
      notes: ''
    }
  };
  const [newChild, setNewChild] = useState(() => ({
    ...initialValues,
    additionalInfo: { ...initialValues.additionalInfo }
  }));
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState(false);

  // Update form when childToEdit changes
  React.useEffect(() => {
    if (childToEdit && open) {
      // Map backend data to form fields
      const genderMapping = {
        'male': 'ذكر',
        'female': 'أنثى'
      };

      // Extract birth date from age if not provided
      let birthDate = childToEdit.birthDate || '';
      if (!birthDate && childToEdit.age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - childToEdit.age;
        birthDate = `${birthYear}-01-01`; // Approximate birth date
      }

      setNewChild({
        name: childToEdit.name || '',
        fullName: childToEdit.name || '',
        age: childToEdit.age || '',
        gender: genderMapping[childToEdit.gender] || childToEdit.gender || '',
        group: childToEdit.group || 'الافتراضي',
        favoriteColor: childToEdit.favoriteColor || '#FF6B6B',
        currentStatus: childToEdit.additionalInfo?.currentStatus || '',
        initialNotes: childToEdit.additionalInfo?.notes || '',
        notes: childToEdit.additionalInfo?.notes || '',
        birthDate: birthDate,
        responsiblePerson: childToEdit.responsiblePerson || '',
        additionalInfo: {
          medicalHistory: childToEdit.additionalInfo?.medicalHistory || '',
          familyBackground: childToEdit.additionalInfo?.familyBackground || '',
          previousAssessments: childToEdit.additionalInfo?.previousAssessments || '',
          notes: childToEdit.additionalInfo?.notes || ''
        }
      });

      // If there's a profile image, we'll keep the URL reference
      if (childToEdit.profileImage) {
        setUploadedImage(childToEdit.profileImage);
      }
    } else if (!childToEdit && open) {
      // Reset form for new child
      setNewChild({
        ...initialValues,
        additionalInfo: { ...initialValues.additionalInfo }
      });
      setUploadedImage(null);
      setExpandedSection(false);
    }
  }, [childToEdit, open]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsUploading(true);
      setUploadedImage(file);
      setTimeout(() => {
        setIsUploading(false);
      }, 1000);
    }
  };

  const validateForm = () => {
    if (!newChild.name.trim()) {
      setError('يرجى إدخال اسم الطفل');
      return false;
    }
    if (!newChild.age || newChild.age < 1 || newChild.age > 18) {
      setError('يرجى إدخال عمر صحيح (1-18 سنة)');
      return false;
    }
    if (!newChild.gender) {
      setError('يرجى اختيار الجنس');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert Arabic gender to English for backend
      const genderMapping = {
        'ذكر': 'male',
        'أنثى': 'female'
      };

      // Prepare child data for backend
      const childData = {
        name: newChild.name.trim(),
        age: parseInt(newChild.age) || 5, // Default age if calculation fails
        gender: genderMapping[newChild.gender] || '', // Convert to English
        group: newChild.group || 'الافتراضي',
        favoriteColor: newChild.favoriteColor,
        additionalInfo: {
          medicalHistory: newChild.additionalInfo.medicalHistory || '',
          familyBackground: newChild.additionalInfo.familyBackground || '',
          previousAssessments: newChild.additionalInfo.previousAssessments || '',
          notes: newChild.additionalInfo.notes || newChild.initialNotes || '' // Combine notes
        }
      };

      // Add current status to additionalInfo notes if provided
      if (newChild.currentStatus) {
        childData.additionalInfo.notes = `الوضع النفسي الحالي: ${newChild.currentStatus}\n${childData.additionalInfo.notes}`;
      }

      // Call the onSubmit prop with the child data and uploaded image
      // Include the child ID if editing
      await onSubmit(childData, uploadedImage, childToEdit?._id || childToEdit?.id);
      
      // Reset form on success
      setNewChild({
        ...initialValues,
        additionalInfo: { ...initialValues.additionalInfo }
      });
      setUploadedImage(null);
      setExpandedSection(false);
    } catch (err) {
      console.error('Error adding child:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء إضافة الطفل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError('');
      // Reset form when closing
      setNewChild({
        ...initialValues,
        additionalInfo: { ...initialValues.additionalInfo }
      });
      setUploadedImage(null);
      setExpandedSection(false);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
          backgroundColor: '#f9fafb',
          borderRight: '1px solid #e5e7eb'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
            {childToEdit ? 'تعديل بيانات الطفل' : 'إضافة طفل جديد'}
          </Typography>
          <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
            <Close />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Personal Image Section */}
        <PersonalImageSection
          uploadedImage={uploadedImage}
          isUploading={isUploading}
          onImageUpload={handleImageUpload}
        />

        {/* Color Picker Section */}
        <ColorPicker
          selectedColor={newChild.favoriteColor}
          onColorSelect={(color) => setNewChild({...newChild, favoriteColor: color})}
        />

        {/* Child Information Section */}
        <ChildInfoForm
          childData={newChild}
          onChange={setNewChild}
          groups={groups}
        />

        <Divider sx={{ my: 3 }} />

        {/* Additional Information Section */}
        <AdditionalInfoSection
          expanded={expandedSection}
          onToggle={() => setExpandedSection(!expandedSection)}
          notes={newChild.additionalInfo.notes || ''}
          onNotesChange={(notes) => setNewChild({
            ...newChild,
            additionalInfo: {...newChild.additionalInfo, notes}
          })}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleClose}
            disabled={isSubmitting}
            sx={{
              color: '#6b7280',
              borderColor: '#e5e7eb',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb'
              }
            }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Add />}
            onClick={handleSubmit}
            disabled={isSubmitting}
            sx={{
              backgroundColor: '#3b82f6',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#2563eb',
                boxShadow: 'none',
              }
            }}
          >
            {isSubmitting ? (childToEdit ? 'جاري الحفظ...' : 'جاري الإضافة...') : (childToEdit ? 'حفظ التغييرات' : 'إضافة الطفل')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddChildDrawer;