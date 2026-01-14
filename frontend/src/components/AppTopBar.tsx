// components/AppTopBar.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Box from '@mui/material/Box';
import { Alert, Chip } from '@mui/material';
import LoginButton from './Login';
import { useAuth } from './AuthProvider';

interface AppTopBarProps {
  open: boolean;
  onMenuClick: () => void;
}

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<MuiAppBarProps & { open?: boolean }>(({ theme, open }) => ({
  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
    },
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const AppTopBar: React.FC<AppTopBarProps> = ({ open, onMenuClick }) => {
  const { user } = useAuth();
  
  return (
    <>
      <AppBar position="fixed" open={open} elevation={0}>
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' }),
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            <MusicNoteIcon sx={{ fontSize: { xs: 28, sm: 32 }, filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))' }} />
            <Typography 
              variant="h5" 
              noWrap 
              component="div"
              sx={{
                fontWeight: 700,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
              }}
            >
              Sumpfig
            </Typography>
            <Chip 
              label="Beta" 
              size="small" 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: '20px',
                display: { xs: 'none', sm: 'flex' },
              }} 
            />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <LoginButton />
        </Toolbar>
      </AppBar>
      
      {/* Demo Mode Banner */}
      {!user && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 1100,
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
          }}
        >
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 0,
              border: 'none',
              background: 'transparent',
              '& .MuiAlert-icon': {
                color: '#3b82f6',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                <strong>Demo Mode:</strong> You're viewing demo content. Login to create your own groups and add tracks!
              </Typography>
            </Box>
          </Alert>
        </Box>
      )}
    </>
  );
};

export default AppTopBar;
