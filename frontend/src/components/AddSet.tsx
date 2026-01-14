import * as React from 'react';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import AddSetForm from './AddSetForm';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialog-paper': {
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.3)',
  },
}));

export default function CustomizedDialogs(props: {open: boolean, handleClickClose: () => void}) {
  const { open, handleClickClose } = props;


  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={handleClickClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle 
          sx={{ 
            m: 0, 
            p: 3,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.5rem',
          }} 
          id="customized-dialog-title"
        >
          Add New Track
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClickClose}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            color: 'white',
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
        <DialogContent dividers>
                  <AddSetForm handleClickClose={handleClickClose}/>
        </DialogContent>
        
      </BootstrapDialog>
    </React.Fragment>
  );
}
