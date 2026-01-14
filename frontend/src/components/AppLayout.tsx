import { styled } from '@mui/material/styles';
import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import AppTopBar from './AppTopBar';
import SongsTable from './SetsTable';
import ActivityFeed from './ActivityFeed';
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
  marginLeft: open ? `16px` : `-${drawerWidth-16}px`,
  marginRight: `16px`,
  marginTop: `16px`,
  marginBottom: `16px`,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
  padding: 0,
  [theme.breakpoints.down('md')]: {
    marginLeft: '8px',
    marginRight: '8px',
    marginTop: '8px',
    marginBottom: '8px',
    width: 'calc(100% - 16px)',
  },
}));

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppTopBar open={sidebarOpen} onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar side="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Main open={sidebarOpen}>
        <Toolbar /> {/* spacer for AppBar */}
        {/* Additional spacer for demo banner when not logged in */}
        {!user && <Box sx={{ height: 48 }} />}
        <SongsTable />
        <Box sx={{ mt: 3 }}>
          <ActivityFeed />
        </Box>
      </Main>
    </Box>
  );
};

export default AppLayout;
