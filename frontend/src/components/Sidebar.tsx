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
  Tooltip,

} from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import GroupIcon from '@mui/icons-material/Group';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { styled } from '@mui/material/styles';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { useAuth } from './AuthProvider';
import {
  addGroupToUser,
  addUserToGroup,
  getGroupsForUser,
  createGroup,
  getGroupsFromIds,
} from 'firebaseServices/firestore';

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

interface Group {
  id: string;
  name: string;
  admin: string;
  members: string[];
  createdAt: string;
}

const Sidebar: React.FC<SidebarProps> = ({ side, open, onClose }) => {
  const theme = useTheme();
  const { user , activeGroupId , setActiveGroupId } = useAuth();
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupIdInput, setGroupIdInput] = useState('');
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  // Fetch groups on mount or when user changes
  useEffect(() => {
    const fetchGroups = async () => {
      if (user?.uid) {
        const groupIds = await getGroupsForUser(user.uid);
        const groups = await getGroupsFromIds(groupIds);
        setUserGroups(groups); // Assuming each group has a 'name' property
        setActiveGroupId(groups[0]?.id || ''); // Set the first group as active by default

        // setUserGroups(groups);
      } else {
        // Demo mode
        const demoGroupIds = ['demo-group-1', 'demo-group-2'];
        const demoGroups = await getGroupsFromIds(demoGroupIds);
        setUserGroups(demoGroups);
        setActiveGroupId(demoGroups[0]?.id || ''); // Set the first group as active by default
      }
    };

    fetchGroups();
  }, [user]);

  const handleGroupClick = (groupId: string) => {
    
      setActiveGroupId(groupId);
      console.log(`Group ID selected: ${groupId}`);
    
  }
  const handleCreateGroup = async () => {
    if (!user || !groupNameInput.trim()) return;
    try {
      // 1. Create the group and get the ID
      const groupId = await createGroup(groupNameInput.trim(), user.uid);
  
      // 2. Add group ID to user's group list
      await addGroupToUser(user.uid, groupId);
  
      // 3. Clear input and show dialog
      setGroupNameInput('');
      setCreatedGroupId(groupId);
      setShowDialog(true);
  
      // 4. Refresh user's group names
      const updatedGroups = await getGroupsForUser(user.uid);
      const groups = await getGroupsFromIds(updatedGroups);
      setUserGroups(groups);
    } catch (error) {
      console.error(error);
      alert('Failed to create group. See console.');
    }
  };
  
  const handleAddGroupToUser = async () => {
    if (!user || !groupIdInput.trim()) return;
    try {
      // Create a new group in Firestore
      await addGroupToUser(user.uid, groupIdInput.trim());
      await addUserToGroup(groupIdInput.trim(), user.uid);
      setGroupIdInput('');
      const updatedGroups = await getGroupsForUser(user.uid);
      const groups = await getGroupsFromIds(updatedGroups);
      setUserGroups(groups); // Assuming each group has a 'name' property
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
          userGroups.map((group) => (
            <ListItem key={group.id} disablePadding>
                      <ListItemButton
          onClick={() => handleGroupClick(group.id)}
          selected={group.id === activeGroupId}
          sx={{
            '&.Mui-selected': {
              backgroundColor: '#f0f0f0',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            },
          }}
        >
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={group.name} />
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
          Create Group
        </Typography>
        <TextField
          label="Group Name"
          value={groupNameInput}
          onChange={(e) => setGroupNameInput(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
        <Tooltip
          title={!user ? "You must be logged in to create a group" : "Enter a group name to enable"}
          placement="top"
        >
          <span>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCreateGroup}
              disabled={!user || !groupNameInput.trim()}
            >
              Create
            </Button>
          </span>
        </Tooltip>

        <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
          <DialogTitle>Group Created</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
             This is the only time this Group ID will be shown. Please copy and share it now if you want others to join.
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField value={createdGroupId} fullWidth disabled />
              <IconButton onClick={() => navigator.clipboard.writeText(createdGroupId)}>
                <ContentCopyIcon />
              </IconButton>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Add User to Group
        </Typography>
        <TextField
          label="Group ID"
          value={groupIdInput}
          onChange={(e) => setGroupIdInput(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
        <Tooltip
          title={!user ? "You must be logged in to be added to a group" : "Enter a group id to enable"}
          placement="top"
        >
          <span>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddGroupToUser}
              disabled={!user || !groupIdInput.trim()}
            >
              Add
            </Button>
          </span>
        </Tooltip>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
