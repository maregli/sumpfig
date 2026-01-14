import React from 'react';
import {
  Box,
  Collapse,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Track } from 'types/track';

type Props = {
  tracks: Track[];
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  genreFilter: string;
  artistFilter: string;
  searchQuery: string;
  minRating: number;
  setGenreFilter: (val: string) => void;
  setArtistFilter: (val: string) => void;
  setSearchQuery: (val: string) => void;
  setMinRating: (val: number) => void;
};

const TrackFilters: React.FC<Props> = ({
  tracks,
  filtersOpen,
  setFiltersOpen,
  genreFilter,
  artistFilter,
  searchQuery,
  minRating,
  setGenreFilter,
  setArtistFilter,
  setSearchQuery,
  setMinRating,
}) => {
  const uniqueGenres = [...new Set(tracks.map((t) => t.genre).filter(Boolean))];
  const uniqueArtists = [...new Set(tracks.map((t) => t.artist).filter(Boolean))];

  const handleClearFilters = () => {
    setGenreFilter('');
    setArtistFilter('');
    setSearchQuery('');
    setMinRating(0);
  };

  const activeFiltersCount = [genreFilter, artistFilter, searchQuery, minRating > 0].filter(Boolean).length;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button
          startIcon={<FilterListIcon />}
          onClick={() => setFiltersOpen(!filtersOpen)}
          variant={filtersOpen ? 'contained' : 'outlined'}
          sx={{
            fontWeight: 600,
            background: filtersOpen ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : undefined,
          }}
        >
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </Button>
        {activeFiltersCount > 0 && (
          <>
            <Chip 
              label={`${activeFiltersCount} active filter${activeFiltersCount > 1 ? 's' : ''}`}
              size="small"
              sx={{ 
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#6366f1',
                fontWeight: 600,
              }}
            />
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              sx={{ color: '#64748b' }}
            >
              Clear All
            </Button>
          </>
        )}
      </Box>

      <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
        <Box 
          sx={{ 
            p: 3,
            mb: 2,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: '2px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Search Title or Tags"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search..."
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ color: '#64748b', mr: 1 }} />,
                },
              }}
            />

            <FormControl fullWidth>
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                label="Genre"
              >
                <MenuItem value="">All Genres</MenuItem>
                {uniqueGenres.sort().map((genre) => (
                  <MenuItem key={genre} value={genre || ''}>
                    {genre || 'Unknown'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="artist-label">Artist</InputLabel>
              <Select
                labelId="artist-label"
                value={artistFilter}
                onChange={(e) => setArtistFilter(e.target.value)}
                label="Artist"
              >
                <MenuItem value="">All Artists</MenuItem>
                {uniqueArtists.sort().map((artist) => (
                  <MenuItem key={artist} value={artist || ''}>
                    {artist || 'Unknown'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="rating-label">Min Rating</InputLabel>
              <Select
                labelId="rating-label"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value as number)}
                label="Min Rating"
              >
                <MenuItem value={0}>All Ratings</MenuItem>
                <MenuItem value={1}>⭐ 1+</MenuItem>
                <MenuItem value={2}>⭐⭐ 2+</MenuItem>
                <MenuItem value={3}>⭐⭐⭐ 3+</MenuItem>
                <MenuItem value={4}>⭐⭐⭐⭐ 4+</MenuItem>
                <MenuItem value={5}>⭐⭐⭐⭐⭐ 5</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Collapse>
    </>
  );
};

export default TrackFilters;
