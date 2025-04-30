// ErrorDialog.tsx

import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, Button, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ErrorDialogProps {
  errorMessage: string;
  open: boolean;
  onClose: () => void;
}

const ErrorDialog: React.FC<ErrorDialogProps> = ({ errorMessage, open, onClose }) => {
  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" id="customized-dialog-title">Error</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={(theme) => ({
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {errorMessage}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          sx={{
            margin: 1,
            textTransform: 'none',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </BootstrapDialog>
  );
};

export default ErrorDialog;

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2),
  },
  '& .MuiDialogTitle-root': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.common.white,
    padding: theme.spacing(2, 3),
  },
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
  },
  '& .MuiButton-contained': {
    borderRadius: theme.shape.borderRadius,
  },
}));
