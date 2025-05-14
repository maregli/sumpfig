// components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import GroupIcon from '@mui/icons-material/Group';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from '@mui/material/styles';

import { useAuth } from './AuthProvider';
import { addGroupToUser, getGroupsForUser } from 'firebaseServices/firestore';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

interface SidebarProps {
  side: 'left' | 'right';
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ side, open, onClose }) => {
  const theme = useTheme();
  const { user , setActiveGroupId } = useAuth();
  const [groupIdInput, setGroupIdInput] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);

  // Fetch groups on mount or when user changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (user?.uid) {
        const groups = await getGroupsForUser(user.uid);
        setUserGroups(groups);
      }
    };

    fetchGroups();
  }, [user]);

  const handleGroupClick = (groupId: string) => {
    if (user) {
      setActiveGroupId(groupId);
      console.log(`Group ID selected: ${groupId}`);
      onClose();
    }
  }

  const handleAddGroup = async () => {
    if (!user || !groupIdInput.trim()) return;
    try {
      await addGroupToUser(user.uid, groupIdInput.trim());
      setGroupIdInput('');
      const updatedGroups = await getGroupsForUser(user.uid);
      setUserGroups(updatedGroups);
    } catch (error) {
      console.error(error);
      alert('Failed to add group. See console.');
    }
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="persistent"
      anchor={side}
      open={open}
    >
      <DrawerHeader>
        <Typography variant="subtitle2" sx={{ px: 1 }}>
          Manage Groups
        </Typography>
        <IconButton onClick={onClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider />

      <List>
        {userGroups.length > 0 ? (
          userGroups.map((groupId) => (
            <ListItem key={groupId} disablePadding>
              <ListItemButton onClick={() => handleGroupClick(groupId)}>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText primary={groupId} />
              </ListItemButton>
            </ListItem>
          ))
        ) : (
          <Typography sx={{ px: 2, py: 1 }} variant="body2" color="text.secondary">
            No groups yet.
          </Typography>
        )}
      </List>

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <TroubleshootIcon />
            </ListItemIcon>
            <ListItemText primary="Song Analysis" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Add Group ID
        </Typography>
        <TextField
          label="Group ID"
          value={groupIdInput}
          onChange={(e) => setGroupIdInput(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
        <Button
          variant="contained"
          fullWidth
          onClick={handleAddGroup}
          disabled={!user || !groupIdInput.trim()}
        >
          Add to User
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
