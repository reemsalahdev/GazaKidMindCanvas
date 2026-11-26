import React from 'react';
import { Box, Typography, TextField } from '@mui/material';

const DrawingNotes = ({
  drawingBehavior,
  setDrawingBehavior
}) => {
  return (
    <>
      {/* Notes Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
          ملاحظات تُفيد تحليل الرسمة
        </Typography>
        
        {/* Behavior Observation */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
            هل لاحظت أي سلوك أو تفاعل أثناء الرسم؟
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            rows={3}
            value={drawingBehavior}
            onChange={(e) => setDrawingBehavior(e.target.value)}
            sx={{
              backgroundColor: '#fff',
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e5e7eb' },
                '&:hover fieldset': { borderColor: '#d1d5db' },
              }
            }}
          />
          <Typography variant="caption" sx={{ color: '#6b7280', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
            صف سلوك الطفل خلال تنفيذ الرسمة إن وجدت ملاحظات واضحة.<br/>
            مثال: "كان يُمسك القلم بشدة"، أو "رسم بسرعة وبلا تركيز"
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default DrawingNotes;