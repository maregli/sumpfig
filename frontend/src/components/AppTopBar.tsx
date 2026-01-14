// components/AppTopBar.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import { Alert } from '@mui/material';
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
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
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
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Sumpfig
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <LoginButton />
        </Toolbar>
      </AppBar>
      
      {/* Demo Mode Banner */}
      {!user && (
        <Box
          sx={{
            position: 'fixed',
            top: 64, // Below AppBar
            left: 0,
            right: 0,
            zIndex: 1100,
          }}
        >
          <Alert severity="info" sx={{ borderRadius: 0 }}>
            <strong>Demo Mode:</strong> You're viewing demo content. Login to create your own groups and add tracks!
          </Alert>
        </Box>
      )}
    </>
  );
};

export default AppTopBar;
