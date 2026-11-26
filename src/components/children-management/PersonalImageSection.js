import React from 'react';
import { Box, Typography } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const PersonalImageSection = ({ uploadedImage, isUploading, onImageUpload }) => {
  // Check if uploadedImage is a URL string or a File object
  const isImageUrl = uploadedImage && typeof uploadedImage === 'string';
  const isFileObject = uploadedImage && uploadedImage instanceof File;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 1.5 }}>
        الصورة الشخصية
      </Typography>
      
      {/* Show image preview if URL exists */}
      {isImageUrl && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Box
            component="img"
            src={uploadedImage}
            alt="الصورة الشخصية"
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              objectFit: 'cover',
              border: '2px solid #e5e7eb'
            }}
          />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6b7280' }}>
            انقر على المربع أدناه لتغيير الصورة
          </Typography>
        </Box>
      )}
      
      <Box
        component="label"
        sx={{
          border: '2px dashed #e5e7eb',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: '#fff',
          cursor: 'pointer',
          display: 'block',
          '&:hover': {
            borderColor: '#d1d5db',
            backgroundColor: '#f9fafb'
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          style={{ display: 'none' }}
        />
        <CloudUpload sx={{ fontSize: 40, color: '#9ca3af', mb: 1 }} />
        <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
          {isImageUrl ? 'تغيير الصورة' : 'Import Files'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
          {isImageUrl ? 'انقر لتحديد صورة جديدة' : 'Drag and drop files here or click to upload'}
        </Typography>
        {isFileObject && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: '#6b7280' }}>
              {uploadedImage.name}
            </Typography>
            {isUploading && (
              <Typography variant="caption" sx={{ color: '#3b82f6', display: 'block' }}>
                Preprocessing...
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PersonalImageSection;