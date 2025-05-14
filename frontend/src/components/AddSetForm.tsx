import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
// import { Typography } from '@mui/material';
import { addTrack } from 'firebaseServices/firestore';

import { useAuth } from 'components/AuthProvider';

import { Track } from 'types/track';

type TrackNoId = Omit<Track, 'id'>; ;

const emptyTrack: TrackNoId = {
  title: '',
  artist: '',
  publish_date: '',
  rating: null,
  genre: '',
  likes: 0,
  tags: [],
  playbacks: 0,
  permalink: '',
  artwork_url: '',
  added_by_name: '', // This should be set to the current user's ID when adding a track
  added_by_id: '', // This should be set to the current user's ID when adding a track
  group_id: '',
};

const AddTrackForm = (props: { handleClickClose: () => void }) => {
  const { user , activeGroupId } = useAuth();
  const { handleClickClose } = props;
  const [track, setTrack] = useState<TrackNoId>({
    ...emptyTrack,
    added_by_name: user ? user.displayName : 'Anonymous', // Set the added_by field to the current user's ID
    added_by_id: user ? user.uid : 'Anonymous', // Set the added_by field to the current user's ID
    group_id: activeGroupId ? activeGroupId : '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrack((prevTrack:TrackNoId) => ({
      ...prevTrack,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      setTrack((prevTrack:TrackNoId) => ({
        ...prevTrack,
      }));
    } else {

      console.error('User not authenticated. Cannot add track.');
      return;
    }
    addTrack(track)
      .then(() => {
        console.log('Track added successfully!');
        // Reset the form after submission
        setTrack({ ...emptyTrack });
        handleClickClose(); // Close the modal after submission
      })
      .catch((error) => {
        console.error('Error adding track:', error);
      });
    };

  const fetchTrackMetadata = async () => {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL
      if (!track.permalink) {
        alert("Please provide a permalink.");
        return;
      }
  
      try {
        const response = await fetch(`${BACKEND_URL}/soundcloud/metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: track.permalink }), // Send the permalink to the backend
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch track metadata');
        }
  
        const data = await response.json();
          // Helper function to format date to 'yyyy-mm-dd'
      const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0]; // Get only the 'yyyy-mm-dd' part
    };
  
        // You can now update fields based on the metadata (e.g., populate title, artist, etc.)
        setTrack((prevTrack:TrackNoId) => ({
          ...prevTrack,
          title: data.title || prevTrack.title,
          artist: data.artist || prevTrack.artist,
          artwork_url: data.artwork_url || prevTrack.artwork_url,
          release_date: data.release_date ? formatDate(data.release_date) : "",
          publish_date: data.publish_date ? formatDate(data.publish_date) : "",
          genre: data.genre || prevTrack.genre,
          likes: data.likes || prevTrack.likes,
          playbacks: data.playbacks || prevTrack.playbacks,
          // add other fields you want to auto-fill from the metadata
        }));
  
        console.log('Track Metadata:', data);
        console.log('Updated Track:', track);
      } catch (error) {
        console.error('Error fetching track metadata:', error);
      }
    };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
    <Box
          component="form"
          sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 3,
              '& .MuiTextField-root': { m: 1, width: '100%' },
              backgroundColor: '#f5f5f5',
          }}
          onSubmit={handleSubmit}
          noValidate
          autoComplete="off"
    >

      <TextField
        label="Title"
        variant="outlined"
        name="title"
        value={track.title}
        onChange={handleChange}
        required
      />

      <TextField
        label="Artist"
        variant="outlined"
        name="artist"
        value={track.artist}
        onChange={handleChange}
        required
      />

      <TextField
        label="Publish Date"
        variant="outlined"
        name="publish_date"
        type="date"
        value={track.publish_date}
        onChange={handleChange}
        required
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        label="Genre"
        variant="outlined"
        name="genre"
        value={track.genre}
        onChange={handleChange}
        required
      />

      <TextField
        label="Likes"
        variant="outlined"
        name="likes"
        type="number"
        value={track.likes}
        onChange={handleChange}
        required
      />

      <TextField
        label="Playbacks"
        variant="outlined"
        name="playbacks"
        type="number"
        value={track.playbacks}
        onChange={handleChange}
        required
      />

        <TextField
        label="Link"
        variant="outlined"
        name="permalink"
        value={track.permalink}
        onChange={handleChange}
        required
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={fetchTrackMetadata}
              edge="end"
              aria-label="fetch track metadata"
            >
                <span role="img" aria-label="fetch">🔍</span>
            </IconButton>
          ),
        }}
      />
        <TextField
          label="Tags"
          variant="outlined"
          name="tags"
          value={track.tags ? track.tags.join(', ') : ''}
          onChange={(e) => {
            const tags = e.target.value.split(',').map((tag) => tag.trim());
            setTrack((prevTrack:TrackNoId) => ({
              ...prevTrack,
              tags: tags,
            }));
          }
          }
          required
        />
      </Box>
      {!user && (
  <Box
    sx={{
      color: 'red',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      mb: 2,
      mt: 1,
    }}
  >
    🔒 You must be logged in to add a track.
  </Box>
)}
    <Box>
        <DialogActions>
    <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 } } onClick={handleSubmit} disabled={!user}>
           Submit
         </Button>
 </DialogActions>
      </Box>
    </Box>

  );
};

export default AddTrackForm;
