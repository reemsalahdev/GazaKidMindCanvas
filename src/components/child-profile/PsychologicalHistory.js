import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Chip
} from '@mui/material';
import { usePsychologicalHistoryContext } from './contexts';

const PsychologicalHistory = () => {
  const { psychologicalHistory: history } = usePsychologicalHistoryContext();
  
  // Get the most recent emotional status for the header chip
  const getOverallStatus = () => {
    if (!history || history.length === 0) return { label: 'لا توجد بيانات', color: '#9ca3af' };
    
    const latest = history[0];
    return {
      label: latest.status || 'عادي',
      color: latest.color || '#9ca3af'
    };
  };

  const overallStatus = getOverallStatus();

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e5e7eb', borderRadius: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
          تاريخ السجل النفسي
        </Typography>
        <Chip
          label={overallStatus.label}
          size="small"
          sx={{
            backgroundColor: `${overallStatus.color}20`,
            color: overallStatus.color,
            fontWeight: 600
          }}
        />
      </Box>

      {/* Timeline */}
      {history && history.length > 0 ? (
        <List>
          {history.map((item, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: item.color || '#9ca3af'
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#6b7280' }}>
                    {item.date}
                  </Typography>
                  <Chip
                    label={item.status || 'عادي'}
                    size="small"
                    sx={{
                      backgroundColor: `${item.color || '#9ca3af'}20`,
                      color: item.color || '#9ca3af',
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                </Box>
                <Box sx={{ ml: 3, pl: 1, borderLeft: index < history.length - 1 ? '2px solid #e5e7eb' : 'none', pb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                    التحليل النفسي
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', lineHeight: 1.7 }}>
                    {item.analysis || 'لا يوجد تحليل متاح لهذه الرسمة'}
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" sx={{ color: '#9ca3af' }}>
            لا توجد رسومات محللة بعد
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af', mt: 1, display: 'block' }}>
            قم برفع وتحليل رسومات الطفل لعرض التاريخ النفسي
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default PsychologicalHistory;