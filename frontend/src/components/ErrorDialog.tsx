import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

type MessageType = 'error' | 'hint';

interface CustomDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  messageType?: MessageType; // <- New prop
}

const BootstrapDialog = styled(Dialog)<{ messageType?: MessageType }>(({ theme, messageType }) => ({
  '& .MuiPaper-root': {
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  '& .MuiDialogTitle-root': {
    background:
      messageType === 'error'
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: theme.palette.common.white,
    padding: theme.spacing(3),
    fontWeight: 700,
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2, 3),
  },
}));

const ErrorDialog: React.FC<CustomDialogProps> = ({
  open,
  onClose,
  title,
  message,
  messageType = 'error',
}) => {
  const theme = useTheme();

  return (
    <BootstrapDialog open={open} onClose={onClose} messageType={messageType}>
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: theme.palette.common.white,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ lineHeight: 1.7, color: '#475569' }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          color={messageType === 'error' ? 'error' : 'info'} 
          onClick={onClose}
          sx={{
            px: 4,
            py: 1.2,
            fontWeight: 600,
            background: messageType === 'error' 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            '&:hover': {
              background: messageType === 'error' 
                ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ErrorDialog;
