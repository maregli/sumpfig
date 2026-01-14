import React, { useState } from 'react';
import { useEffect } from 'react';
import {
  IconButton,
  Collapse,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
//   ListItemText,
  Divider,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from './AuthProvider';
import { SIDEBAR_WIDTH } from 'utils/constants';
import { deleteTracks, getTracksFromIds, postComment, getComments, getDisplayNameFromUserId, getTrackFromId } from 'firebaseServices/firestore';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';


interface TrackComment {
  id?: string;
  text: string;
  author: string;
  timestamp: Date;
}


interface SmallSidebarProps {
  trackId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  setErrorMessage: (message: string) => void;
  setShowErrorDialog: (show: boolean) => void;
  setSelected: (selected: string[]) => void;
}

export default function SmallSidebar({
  trackId,
  open,
  setOpen,
  setErrorMessage,
  setShowErrorDialog,
  setSelected,
}: SmallSidebarProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [trackTitle, setTrackTitle] = useState('');

  const handleDeleteSelected = async () => {
    const selectedTracks = await getTracksFromIds([trackId]);
    const allTracksAddedByUser = selectedTracks.every(
      (track) => track.added_by_id === user?.uid
    );

    try {
      if (allTracksAddedByUser || user?.role === 'admin') {
        await deleteTracks([trackId]);
        setOpen(false);
      } else {
        setErrorMessage('You can only delete tracks that you yourself have added.');
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.error('Error deleting tracks:', error);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: TrackComment = {
        text: newComment.trim(),
        author: user?.displayName || 'Anonymous',
        timestamp: new Date(),
      };
  
      // Optimistically update UI
      setComments([...comments, comment]);
      setNewComment('');
  
      if (user) {
        // Logged-in: persist comment to backend
        postComment(trackId, user.uid, newComment.trim())
          .then(() => {
            console.log('Comment posted successfully');
          })
          .catch((error) => {
            console.error('Error posting comment:', error);
            setErrorMessage('Failed to post comment. Please try again.');
            setShowErrorDialog(true);
          });
      } else {
        // Not logged in: write to localStorage
        try {
          const key = `comments_${trackId}`;
          const existing = localStorage.getItem(key);
          const parsed: TrackComment[] = existing ? JSON.parse(existing) : [];
          parsed.push(comment);
          localStorage.setItem(key, JSON.stringify(parsed));
          console.log('Comment saved to local cache');
        } catch (e) {
          console.error('Error saving comment to local cache:', e);
        }
      }
    }
  };
  

  const handleEditTrack = () => {
    console.log(`Edit track ${trackId}`);
    // Placeholder for future implementation
  };

  const handleClose = () => {
    setOpen(false);
    setSelected([]);
  }

  useEffect(() => {
    const loadCommentsWithDisplayNames = async () => {
      if (!trackId || !open) return;
  
      try {
        const fetchedTrack = await getTrackFromId(trackId);
        if (fetchedTrack) {
          setTrackTitle(fetchedTrack.title || 'Unknown Track');
        } else {
          setErrorMessage('Track not found.');
          setShowErrorDialog(true);
          return;
        }
        const fetchedComments = await getComments(trackId);
  
        const userIds = Array.from(new Set(fetchedComments.map((c) => c.author)));
  
        // Fetch display names in parallel
        const displayNames = await Promise.all(
          userIds.map((uid) => getDisplayNameFromUserId(uid))
        );
  
        // Map userId -> displayName
        const userMap = new Map(userIds.map((uid, idx) => [uid, displayNames[idx]]));
  
        // Replace author ID with display name
        const commentsWithNames = fetchedComments.map((comment) => ({
          ...comment,
          author: userMap.get(comment.author) || 'Anonymous',
        }));
  
        setComments(commentsWithNames);
      } catch (error) {
        console.error('Error loading comments:', error);
        setErrorMessage('Failed to load comments.');
        setShowErrorDialog(true);
      }
    };
  
    loadCommentsWithDisplayNames();
  }, [trackId, open, setErrorMessage, setShowErrorDialog]);
  

  return (
    <Collapse in={open} orientation="horizontal">
      <Paper
        elevation={0}
        sx={{
          width: SIDEBAR_WIDTH,
          height: '100vh',
          p: 3,
          boxSizing: 'border-box',
          overflow: 'auto',
          marginLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '20px 0 0 20px',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '-10px 0 30px -5px rgba(99, 102, 241, 0.15)',
          border: '1px solid #e2e8f0',
          borderRight: 'none',
        }}
      >
        {/* Close Button */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" sx={{ mb: 2 }}>
          <IconButton 
            onClick={() => handleClose()}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#1e293b',
            mb: 3,
            pb: 2,
            borderBottom: '2px solid #e2e8f0',
          }}
        >
          {trackTitle}
        </Typography>
        
        {/* Star Rating Card */}
        <Box 
          sx={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
            padding: 2.5, 
            borderRadius: '16px', 
            mb: 3,
            border: '2px solid #c7d2fe',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.1)',
          }} 
          alignContent={"center"}
        >
          <StarRating id={trackId}/>
        </Box>

        {/* New Comment Input */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600, 
            color: '#1e293b', 
            mb: 2 
          }}
        >
          Add Comment
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Share your thoughts..."
          multiline
          minRows={3}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          fullWidth
          sx={{
            py: 1.5,
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            },
          }}
        >
          Post Comment
        </Button>

        <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

        {/* Comment List */}
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 600, 
            color: '#1e293b', 
            mb: 2 
          }}
        >
          Comments ({comments.length})
        </Typography>
        <List sx={{ flexGrow: 1 }}>
          {comments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No comments yet. Be the first to share!
              </Typography>
            </Box>
          ) : (
            comments.map((comment, index) => (
                <ListItem 
                  key={index} 
                  alignItems="flex-start" 
                  disableGutters 
                  sx={{ mb: 2 }}
                >
                  <Grid container>
                    {/* Top row: Author and timestamp */}
                    <Grid size={6} textAlign={"left"}>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ color: '#6366f1' }}
                        >
                          {comment.author}
                        </Typography>
                        </Grid>
                        <Grid size={6} textAlign="right" alignContent={"right"}>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ fontSize: '0.75rem' }}
                        >
                            {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                        </Typography>
                        </Grid>
              
                    {/* Bottom row: Comment text */}
                    <Grid size={12}>
                    <Box
                        sx={{
                        maxWidth: SIDEBAR_WIDTH,
                        p: 2,
                        mt: 1,
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        }}
                    >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: "break-word",
                            lineHeight: 1.6,
                            color: '#475569',
                          }}
                        >
                        {comment.text}
                        </Typography>
                    </Box>
                    </Grid>
                  </Grid>
                </ListItem>
              ))
              
          )}
        </List>

        {/* Bottom Buttons */}
        <Divider sx={{ mt: 3, mb: 2, borderColor: '#e2e8f0' }} />
        <Box mt="auto" display="flex" flexDirection="column" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditTrack}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 600,
              borderWidth: 2,
              borderColor: '#6366f1',
              color: '#6366f1',
              '&:hover': {
                borderWidth: 2,
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
              },
            }}
          >
            Edit Track
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
            fullWidth
            sx={{
              py: 1.2,
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            }}
          >
            Delete Track
          </Button>
        </Box>
      </Paper>
    </Collapse>
  );
}
