import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import AppTopBar from './AppTopBar';
import SongsTable from './SetsTable';
import { useAuth } from './AuthProvider';

const drawerWidth = 240;

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{ open: boolean }>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: open ? `10px` : `-${drawerWidth-10}px`,
  marginRight: `10px`,
  marginTop: `10px`,
  marginBottom: `10px`,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
  padding: 0, // ✅ Remove padding
}));

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppTopBar open={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar side="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Main open={sidebarOpen}>
        <Toolbar /> {/* spacer for AppBar */}
        {/* Additional spacer for demo banner when not logged in */}
        {!user && <Box sx={{ height: 48 }} />}
        <SongsTable />
      </Main>
    </Box>
  );
};

export default AppLayout;
