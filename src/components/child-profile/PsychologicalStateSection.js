import React from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';
import EmotionalStatusSlider from './EmotionalStatusSlider';
import { useEmotionalStatusContext } from './contexts';

const PsychologicalStateSection = () => {
  const { emotionalStatus, updateEmotionalStatus } = useEmotionalStatusContext();
  
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 1.5, mb: 3 }}>
      {/* Status Sliders */}
      <Box>
        <EmotionalStatusSlider
          label="خائف"
          value={emotionalStatus.anxiety}
          emoji="😔"
          color="#ef4444"
          onChange={(e, newValue) => updateEmotionalStatus({...emotionalStatus, anxiety: newValue})}
        />
        
        <EmotionalStatusSlider
          label="حزين"
          value={emotionalStatus.sadness}
          emoji="😟"
          color="#f59e0b"
          onChange={(e, newValue) => updateEmotionalStatus({...emotionalStatus, sadness: newValue})}
        />
        
        <EmotionalStatusSlider
          label="سعيد"
          value={emotionalStatus.happiness}
          emoji="😊"
          color="#10b981"
          onChange={(e, newValue) => updateEmotionalStatus({...emotionalStatus, happiness: newValue})}
        />
      </Box>
    </Paper>
  );
};

export default PsychologicalStateSection;