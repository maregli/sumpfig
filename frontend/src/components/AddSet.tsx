import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';

// Song interface
interface Song {
  title: string;
  artist: string;
  album: string | null;
  release_date: string | null;
  publish_date: string;
  genre: string;
  likes: number;
  playbacks: number;
  permalink: string;
  artwork_url: string;
}

const SongForm = () => {
  const [song, setSong] = useState<Song>({
    title: '',
    artist: '',
    album: '',
    release_date: '',
    publish_date: '',
    genre: '',
    likes: 0,
    playbacks: 0,
    permalink: '',
    artwork_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSong((prevSong) => ({
      ...prevSong,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic (e.g., API call)
    console.log('Song Data Submitted:', song);
    };

    const fetchTrackMetadata = async () => {
        if (!song.permalink) {
          alert("Please provide a permalink.");
          return;
        }
    
        try {
          const response = await fetch('http://127.0.0.1:5000/soundcloud/metadata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: song.permalink }), // Send the permalink to the backend
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
          setSong((prevSong) => ({
            ...prevSong,
            title: data.title || prevSong.title,
            artist: data.artist || prevSong.artist,
            album: data.album || prevSong.album,
            artwork_url: data.artwork_url || prevSong.artwork_url,
            release_date: data.release_date ? formatDate(data.release_date) : "",
            publish_date: data.publish_date ? formatDate(data.publish_date) : "",
            genre: data.genre || prevSong.genre,
            likes: data.likes || prevSong.likes,
            playbacks: data.playbacks || prevSong.playbacks,
            // add other fields you want to auto-fill from the metadata
          }));
    
          console.log('Track Metadata:', data);
        } catch (error) {
          console.error('Error fetching track metadata:', error);
        }
      };

  return (
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
      <Typography variant="h5" gutterBottom sx={{color: '#333'}}>
        Add a New Song
      </Typography>

      <TextField
        label="Title"
        variant="outlined"
        name="title"
        value={song.title}
        onChange={handleChange}
        required
      />

      <TextField
        label="Artist"
        variant="outlined"
        name="artist"
        value={song.artist}
        onChange={handleChange}
        required
      />

      <TextField
        label="Album"
        variant="outlined"
        name="album"
        value={song.album || ''}
        onChange={handleChange}
        helperText="Optional"
      />

      <TextField
        label="Release Date"
        variant="outlined"
        name="release_date"
        type="date"
        value={song.release_date || ''}
        onChange={handleChange}
        InputLabelProps={{
          shrink: true,
        }}
      />

      <TextField
        label="Publish Date"
        variant="outlined"
        name="publish_date"
        type="date"
        value={song.publish_date}
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
        value={song.genre}
        onChange={handleChange}
        required
      />

      <TextField
        label="Likes"
        variant="outlined"
        name="likes"
        type="number"
        value={song.likes}
        onChange={handleChange}
        required
      />

      <TextField
        label="Playbacks"
        variant="outlined"
        name="playbacks"
        type="number"
        value={song.playbacks}
        onChange={handleChange}
        required
      />

        <TextField
        label="Permalink"
        variant="outlined"
        name="permalink"
        value={song.permalink}
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
        label="Artwork URL"
        variant="outlined"
        name="artwork_url"
        value={song.artwork_url}
        onChange={handleChange}
        helperText="URL of the song's artwork image"
        required
      />

      <Button variant="contained" color="primary" type="submit" sx={{ mt: 2 }}>
        Submit
      </Button>
    </Box>
  );
};

export default SongForm;
