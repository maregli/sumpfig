import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  MusicNote as MusicNoteIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  Comment as CommentIcon,
  PersonAdd as PersonAddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { Activity } from 'types/activity';
import { subscribeToGroupActivities } from 'firebaseServices/firestore';
import { useAuth } from './AuthProvider';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expanded, setExpanded] = useState(true);
  const { activeGroupId } = useAuth();

  useEffect(() => {
    if (!activeGroupId) return;

    const unsubscribe = subscribeToGroupActivities(activeGroupId, setActivities, 20);
    return () => unsubscribe();
  }, [activeGroupId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'track_added':
        return <MusicNoteIcon sx={{ color: '#10b981' }} />;
      case 'track_deleted':
        return <DeleteIcon sx={{ color: '#ef4444' }} />;
      case 'track_rated':
        return <StarIcon sx={{ color: '#fbbf24' }} />;
      case 'comment_added':
        return <CommentIcon sx={{ color: '#3b82f6' }} />;
      case 'user_joined_group':
        return <PersonAddIcon sx={{ color: '#8b5cf6' }} />;
      default:
        return <MusicNoteIcon />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'track_added':
        return (
          <>
            <strong>{activity.userName}</strong> added{' '}
            <em>{activity.trackTitle || 'a track'}</em>
          </>
        );
      case 'track_deleted':
        return (
          <>
            <strong>{activity.userName}</strong> deleted{' '}
            <em>{activity.trackTitle || 'a track'}</em>
          </>
        );
      case 'track_rated':
        return (
          <>
            <strong>{activity.userName}</strong> rated{' '}
            <em>{activity.trackTitle || 'a track'}</em>{' '}
            {activity.rating && (
              <Box component="span" sx={{ color: '#fbbf24' }}>
                {'★'.repeat(activity.rating)}
              </Box>
            )}
          </>
        );
      case 'comment_added':
        return (
          <>
            <strong>{activity.userName}</strong> commented on{' '}
            <em>{activity.trackTitle || 'a track'}</em>
          </>
        );
      case 'user_joined_group':
        return (
          <>
            <strong>{activity.userName}</strong> joined the group
          </>
        );
      default:
        return <>{activity.userName} performed an action</>;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'track_added':
        return '#10b981';
      case 'track_deleted':
        return '#ef4444';
      case 'track_rated':
        return '#fbbf24';
      case 'comment_added':
        return '#3b82f6';
      case 'user_joined_group':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.15)',
        border: '1px solid #e2e8f0',
        mb: 2,
      }}
    >
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '2px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1e293b',
              letterSpacing: '-0.01em',
            }}
          >
            Recent Activity
          </Typography>
          {activities.length > 0 && (
            <Chip
              label={activities.length}
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#6366f1',
                fontWeight: 600,
              }}
            />
          )}
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)} size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <List sx={{ p: 0 }}>
          {activities.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No recent activity. Start adding tracks!
              </Typography>
            </Box>
          ) : (
            activities.map((activity, index) => (
              <ListItem
                key={activity.id}
                sx={{
                  borderBottom: index < activities.length - 1 ? '1px solid #f1f5f9' : 'none',
                  py: 2,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#f8fafc',
                  },
                  transition: 'background-color 0.2s ease',
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: `${getActivityColor(activity.type)}20`,
                      color: getActivityColor(activity.type),
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {getActivityText(activity)}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Collapse>
    </Paper>
  );
};

export default ActivityFeed;
