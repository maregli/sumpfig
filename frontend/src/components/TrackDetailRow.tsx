import React, { useState, useEffect } from 'react';
import {
  TableRow,
  TableCell,
  Collapse,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  Chip,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from './AuthProvider';
import { Track } from 'types/track';
import { 
  deleteTracks, 
  getTracksFromIds, 
  postComment, 
  getComments,
} from 'firebaseServices/firestore';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

interface TrackComment {
  id?: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface TrackDetailRowProps {
  track: Track;
  open: boolean;
  colSpan: number;
  onClose: () => void;
  setErrorMessage: (message: string) => void;
  setShowErrorDialog: (show: boolean) => void;
}

const TrackDetailRow: React.FC<TrackDetailRowProps> = ({
  track,
  open,
  colSpan,
  onClose,
  setErrorMessage,
  setShowErrorDialog,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (open && track.id) {
      getComments(track.id)
        .then((fetchedComments) => {
          const commentsWithDates = fetchedComments.map((comment) => ({
            ...comment,
            timestamp: comment.timestamp instanceof Date ? comment.timestamp : new Date(comment.timestamp),
          }));
          setComments(commentsWithDates);
        })
        .catch((error) => {
          console.error('Error fetching comments:', error);
        });
    }
  }, [open, track.id]);

  const handleDeleteTrack = async () => {
    if (!window.confirm(`Are you sure you want to delete "${track.title}"?`)) {
      return;
    }

    const selectedTracks = await getTracksFromIds([track.id]);
    const allTracksAddedByUser = selectedTracks.every(
      (t) => t.added_by_id === user?.uid
    );

    try {
      if (allTracksAddedByUser || user?.role === 'admin') {
        await deleteTracks([track.id]);
        onClose();
      } else {
        setErrorMessage('You can only delete tracks that you yourself have added.');
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.error('Error deleting track:', error);
      setErrorMessage('Failed to delete track. Please try again.');
      setShowErrorDialog(true);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      const comment: TrackComment = {
        text: newComment.trim(),
        author: user.displayName || 'Anonymous',
        timestamp: new Date(),
      };

      // Optimistically update UI
      setComments([...comments, comment]);
      setNewComment('');

      try {
        await postComment(track.id, user.uid, newComment.trim());
      } catch (error) {
        console.error('Error posting comment:', error);
        setErrorMessage('Failed to post comment. Please try again.');
        setShowErrorDialog(true);
        // Revert optimistic update
        setComments(comments);
      }
    }
  };

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={colSpan}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ margin: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '2px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Left Column - Track Details */}
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <MusicNoteIcon sx={{ color: '#6366f1' }} />
                      Track Details
                    </Typography>

                    {track.artwork_url && (
                      <Box
                        component="img"
                        src={track.artwork_url}
                        alt={track.title || 'Track artwork'}
                        sx={{
                          width: '100%',
                          maxWidth: '300px',
                          borderRadius: '12px',
                          mb: 2,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="body1">
                          <strong>Artist:</strong> {track.artist || 'Unknown'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MusicNoteIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="body1">
                          <strong>Genre:</strong> {track.genre || 'Unknown'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="body1">
                          <strong>Published:</strong>{' '}
                          {track.publish_date
                            ? new Date(track.publish_date).toLocaleDateString()
                            : 'Unknown'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="body1">
                          <strong>Likes:</strong> {track.likes?.toLocaleString() || 0}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayArrowIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="body1">
                          <strong>Playbacks:</strong> {track.playbacks?.toLocaleString() || 0}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Tags:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {track.tags && track.tags.length > 0 ? (
                            track.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                                  color: '#6366f1',
                                  fontWeight: 600,
                                }}
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No tags
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body1">
                          <strong>Added by:</strong> {track.added_by_name || 'Unknown'}
                        </Typography>
                      </Box>

                      {track.permalink && (
                        <Button
                          variant="outlined"
                          href={track.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            mt: 2,
                            fontWeight: 600,
                            borderColor: '#6366f1',
                            color: '#6366f1',
                            '&:hover': {
                              borderColor: '#4f46e5',
                              background: 'rgba(99, 102, 241, 0.05)',
                            },
                          }}
                        >
                          Open in SoundCloud
                        </Button>
                      )}

                      {(user?.uid === track.added_by_id || user?.role === 'admin') && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={handleDeleteTrack}
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          Delete Track
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Right Column - Rating & Comments */}
                <Box>
                  {/* Rating Section */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 2,
                      }}
                    >
                      Your Rating
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <StarRating id={track.id} />
                    </Box>
                  </Box>

                  {/* Comments Section */}
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 2,
                      }}
                    >
                      Comments ({comments.length})
                    </Typography>

                    {/* Add Comment */}
                    <Box sx={{ mb: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        variant="outlined"
                        sx={{
                          mb: 1,
                          '& .MuiOutlinedInput-root': {
                            background: 'white',
                            borderRadius: '12px',
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        sx={{
                          fontWeight: 600,
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          },
                        }}
                      >
                        Post Comment
                      </Button>
                    </Box>

                    {/* Comments List */}
                    <Box
                      sx={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f5f9',
                          borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#cbd5e1',
                          borderRadius: '4px',
                          '&:hover': {
                            background: '#94a3b8',
                          },
                        },
                      }}
                    >
                      {comments.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                          No comments yet. Be the first to comment!
                        </Typography>
                      ) : (
                        <List sx={{ p: 0 }}>
                          {comments.map((comment, index) => (
                            <React.Fragment key={comment.id || index}>
                              <ListItem
                                sx={{
                                  flexDirection: 'column',
                                  alignItems: 'flex-start',
                                  background: 'white',
                                  borderRadius: '12px',
                                  mb: 1,
                                  p: 2,
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: 700, color: '#6366f1' }}
                                  >
                                    {comment.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#334155' }}>
                                  {comment.text}
                                </Typography>
                              </ListItem>
                            </React.Fragment>
                          ))}
                        </List>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};

export default TrackDetailRow;
