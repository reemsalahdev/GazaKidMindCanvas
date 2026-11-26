import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

const DeleteGroupDialog = ({ open, onClose, onConfirm, groupName, childrenCount }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pb: 1,
        pt: 0
      }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 2
          }}
        >
          <WarningAmber sx={{ color: '#dc2626', fontSize: 28 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>
          حذف المجموعة
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#6b7280' }}>
          هل أنت متأكد من حذف مجموعة "{groupName}"؟
          {childrenCount > 0 && (
            <>
              <br />
              سيتم إزالة {childrenCount} طفل من هذه المجموعة
            </>
          )}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 0 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            minWidth: 100,
            textTransform: 'none',
            borderColor: '#e5e7eb',
            color: '#374151',
            '&:hover': {
              borderColor: '#d1d5db',
              backgroundColor: '#f9fafb'
            }
          }}
        >
          إلغاء
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            minWidth: 100,
            backgroundColor: '#dc2626',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#b91c1c'
            }
          }}
        >
          حذف
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteGroupDialog;