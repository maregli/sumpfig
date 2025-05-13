import React from 'react';
import { IconButton, Collapse, Paper, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from './AuthProvider';
import { SIDEBAR_WIDTH } from 'utils/constants';
import { deleteTracks , getTracksFromIds} from 'firebaseServices/firestore';


interface SmallSidebarProps {
    trackId: string;
    open: boolean;
    setOpen: (open: boolean) => void;
    setErrorMessage: (message: string) => void;
    setShowErrorDialog: (show: boolean) => void;
}
    

export default function SmallSidebar({ trackId, open, setOpen, setErrorMessage, setShowErrorDialog }: SmallSidebarProps) {
    const { user } = useAuth(); // Assuming you have a hook to get the current user
    const handleDeleteSelected = async () => {
        const selectedTracks = await getTracksFromIds([trackId]); // Fetch the selected tracks
        const allTracksAddedByUser = selectedTracks.every((track) => track.added_by_id === user?.uid);
        
    
        try {
            if (allTracksAddedByUser || user?.role === 'admin') {
                await deleteTracks([trackId]); // Delete the selected tracks
                setOpen(false); // Clear selected track IDs after deletion
            } else {
                setErrorMessage('You can only delete tracks that you yourself have added.');
                setShowErrorDialog(true);
            }
        } catch (error: any) {
            console.error('Error deleting tracks:', error);
        }
    }
        
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
        }}
          >
        <IconButton
          onClick={() => {
            setOpen(false);
          }}
          sx={{ right: 10 }}
        >
          <CloseIcon />
              </IconButton>
          <IconButton>
            <DeleteIcon onClick={() => handleDeleteSelected()} color="error"  />
          </IconButton>
                  
        <Typography variant="h6">Sidebar</Typography>
        <Typography variant="body2" mt={1}>
          This is a collapsible sidebar. Add your nav or tools here. This is the track id: {trackId}
        </Typography>
      </Paper>
    </Collapse>
  );
}
