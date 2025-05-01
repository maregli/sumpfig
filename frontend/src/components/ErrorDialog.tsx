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
  '& .MuiDialogTitle-root': {
    backgroundColor:
      messageType === 'error'
        ? theme.palette.error.main
        : theme.palette.info.main, // You can also use `primary`, `warning`, etc.
    color: theme.palette.common.white,
    padding: theme.spacing(2, 3),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1, 3),
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
            right: 8,
            top: 8,
            color: theme.palette.common.white,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color={messageType === 'error' ? 'error' : 'info'} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ErrorDialog;
