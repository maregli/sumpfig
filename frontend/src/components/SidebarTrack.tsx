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
}

export default function SmallSidebar({
  trackId,
  open,
  setOpen,
  setErrorMessage,
  setShowErrorDialog,
}: SmallSidebarProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [_isLoadingComments, setIsLoadingComments] = useState(false);
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
      setComments([...comments, comment]);
      setNewComment('');
      postComment(trackId, user?.uid || '', newComment.trim())
        .then(() => {
          console.log('Comment posted successfully');
        })
        .catch((error) => {
          console.error('Error posting comment:', error);
          setErrorMessage('Failed to post comment. Please try again.');
          setShowErrorDialog(true);
        });
    }
  };

  const handleEditTrack = () => {
    console.log(`Edit track ${trackId}`);
    // Placeholder for future implementation
  };

  useEffect(() => {
    const loadCommentsWithDisplayNames = async () => {
      if (!trackId || !open) return;
      setIsLoadingComments(true);
  
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
      } finally {
        setIsLoadingComments(false);
      }
    };
  
    loadCommentsWithDisplayNames();
  }, [trackId, open]);
  

  return (
    <Collapse in={open} orientation="horizontal">
      <Paper
        elevation={3}
        sx={{
          width: SIDEBAR_WIDTH,
          height: '100vh',
          p: 2,
          boxSizing: 'border-box',
          overflow: 'auto',
          marginLeft: '10px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography
  variant="h6"
  gutterBottom
  sx={{
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: 'black',
    textTransform: 'capitalize',
  }}
>
  {trackTitle}
</Typography>
        <Box sx={{backgroundColor: "#f0f0f0", padding: 1, borderRadius: 1, mb: 2}} alignContent={"center"}>
          <StarRating id={trackId}/>
        </Box>

        {/* New Comment Input */}
        <TextField
          fullWidth
          variant="outlined"
          label="Add a comment"
          multiline
          minRows={2}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
        >
          Post Comment
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Comment List */}
        <List sx={{ flexGrow: 1 }}>
          {comments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No comments yet.
            </Typography>
          ) : (
            comments.map((comment, index) => (
                <ListItem key={index} alignItems="flex-start" disableGutters sx={{ mb: 0.5 }}>
                  <Grid container>
                    {/* Top row: Author and timestamp */}
                    <Grid size={6} textAlign={"left"}>
                        <Typography variant="body2" fontWeight="bold">
                          {comment.author}
                        </Typography>
                        </Grid>
                        <Grid size={6} textAlign="right" alignContent={"right"}>
                        <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                        </Typography>
                        </Grid>
              
                    {/* Bottom row: Comment text */}
                    <Grid size={12}>
                    <Box
                        sx={{
                        maxWidth: SIDEBAR_WIDTH, // or a fixed height like 100
                        p: 1,
                        borderRadius: 1,
                        }}
                    >
                        <Typography variant="body1" sx={{ wordBreak: "break-word" }}>
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
        <Divider sx={{ mt: 2, mb: 1 }} />
        <Box mt="auto" display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<EditIcon />}
            onClick={handleEditTrack}
          >
            Edit Track
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteSelected}
          >
            Delete Track
          </Button>
        </Box>
      </Paper>
    </Collapse>
  );
}
