import React from 'react';
// import {
//   Box,
//   Collapse,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   TextField
// } from '@mui/material';
// import Grid from '@mui/material/Unstable_Grid2'; // New Grid API
// import FilterListIcon from '@mui/icons-material/FilterList';
// import { Track } from 'types/track';

// type Props = {
//   tracks: Track[];
//   filtersOpen: boolean;
//   setFiltersOpen: (open: boolean) => void;
//   genreFilter: string;
//   artistFilter: string;
//   searchQuery: string;
//   setGenreFilter: (val: string) => void;
//   setArtistFilter: (val: string) => void;
//   setSearchQuery: (val: string) => void;
// };

// const TrackFilters: React.FC<Props> = ({
//   tracks,
//   filtersOpen,
//   setFiltersOpen,
//   genreFilter,
//   artistFilter,
//   searchQuery,
//   setGenreFilter,
//   setArtistFilter,
//   setSearchQuery,
// }) => {
//   const uniqueGenres = [...new Set(tracks.map((t) => t.genre))];
//   const uniqueArtists = [...new Set(tracks.map((t) => t.artist))];

//   return (
//     <>
//       <Button
//         startIcon={<FilterListIcon />}
//         onClick={() => setFiltersOpen(!filtersOpen)}
//         sx={{ m: 2 }}
//       >
//         {filtersOpen ? 'Hide Filters' : 'Show Filters'}
//       </Button>

//       <Collapse in={filtersOpen} timeout="auto" unmountOnExit>
//         <Box sx={{ p: 2 }}>
//           <Grid container spacing={2}>
//             <Grid size={{ xs: 12, sm: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel id="genre-label">Genre</InputLabel>
//                 <Select
//                   labelId="genre-label"
//                   value={genreFilter}
//                   onChange={(e) => setGenreFilter(e.target.value)}
//                   label="Genre"
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   {uniqueGenres.map((genre) => (
//                     <MenuItem key={genre} value={genre}>
//                       {genre}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 4 }}>
//               <FormControl fullWidth>
//                 <InputLabel id="artist-label">Artist</InputLabel>
//                 <Select
//                   labelId="artist-label"
//                   value={artistFilter}
//                   onChange={(e) => setArtistFilter(e.target.value)}
//                   label="Artist"
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   {uniqueArtists.map((artist) => (
//                     <MenuItem key={artist} value={artist}>
//                       {artist}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid size={{ xs: 12, sm: 4 }}>
//               <TextField
//                 fullWidth
//                 label="Search Title or Tags"
//                 variant="outlined"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </Grid>
//           </Grid>
//         </Box>
//       </Collapse>
//     </>
//   );
// };
const TrackFilters = () => {
  return (
    <div>
      <h2>Track Filters</h2>
      <p>Filters will be implemented here.</p>
    </div>
  );
}
export default TrackFilters;
