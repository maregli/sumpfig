import * as React from 'react';
import { useState, useEffect, useMemo } from 'react'; // Import useEffect and useState
// import ReactPlayer from 'react-player';
import { Track} from 'types/track';
// import songs from 'data/songs.json';
// import SoundCloudPlayer from 'components/SoundCloudPlayer';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import { Button, TableFooter, IconButton, Checkbox } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import AddSet from './AddSet';
import {
  // subscribeToTracks,
  subscribeToAverageRating, subscribeToTracksByGroupId
} from 'firebaseServices/firestore';
// import { useAuth } from 'components/AuthProvider';
import ErrorDialog from './ErrorDialog';
import TrackDetailRow from './TrackDetailRow';
import TrackFilters from './TrackFilters';
import { useAuth } from './AuthProvider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) : (0 | 1 | -1) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | string[] | null },
  b: { [key in Key]: number | string | string[] | null }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Track;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'title',
    numeric: false,
    disablePadding: true,
    label: 'Title',
  },
  {
    id: 'artist',
    numeric: false,
    disablePadding: false,
    label: 'Artist',
  },
  {
    id: 'rating',
    numeric: true,
    disablePadding: false,
    label: 'Rating',
  },
  {
    id: 'added_by_name',
    numeric: false,
    disablePadding: false,
    label: 'Added By',
  }
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Track) => void;
  order: Order;
  orderBy: string;
  editMode: boolean;
  numSelected: number;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort, editMode, numSelected, rowCount, onSelectAllClick } = props;
  const createSortHandler = (property: keyof Track) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {editMode ? (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all editable tracks',
              }}
            />
          </TableCell>
        ) : (
          <TableCell padding="checkbox">Link</TableCell>
        )}
        <TableCell padding="checkbox" />
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding='normal'
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}



export default function SongsTable() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [tracks, setTracks] = useState<Track[] | []>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Track>('title');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { activeGroupId, user } = useAuth();

  // Edit mode & selection
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<readonly string[]>([]);

  // Filter states
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [genreFilter, setGenreFilter] = useState('');
  const [artistFilter, setArtistFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);

  // // const { user } = useAuth();
  // useEffect(() => {
  //   const unsubscribe = subscribeToTracks(setTracks, setIsLoading, () => {});

  //   return () => unsubscribe();
  // }, []); // Empty dependency array ensures this runs only once on mount
    // const { user } = useAuth();
  useEffect(() => {
      const unsubscribe = subscribeToTracksByGroupId(activeGroupId || "", setTracks, setIsLoading, () => {});
  
      return () => unsubscribe();
    }, [activeGroupId]); // Empty dependency array ensures this runs only once on mount
  
  useEffect(() => {
    if (!tracks) return;
  
    const unsubscribers: (() => void)[] = [];
  
    tracks.forEach((track) => {
      const unsubscribe = subscribeToAverageRating(track.id, (trackId, avg) => {
        setAverageRatings(prev => ({ ...prev, [trackId]: avg }));
      });
      unsubscribers.push(unsubscribe);
    });
  
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [tracks]);

  const handleAddTrackOpen = () => {
    setAddTrackOpen(true);
  };
  const handleAddTrackClose = () => {
    setAddTrackOpen(false);
  };

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Track) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (_event: React.MouseEvent<unknown>, id: string) => {
    if (!editMode) {
      setExpandedRow(expandedRow === id ? null : id);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const userTracks = visibleRows.filter(track => 
        track.added_by_id === user?.uid || user?.role === 'admin'
      ).map(n => n.id);
      setSelected(userTracks);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (_event: React.MouseEvent<unknown>, id: string, track: Track) => {
    // Only allow selection if user owns the track or is admin
    if (track.added_by_id !== user?.uid && user?.role !== 'admin') {
      return;
    }

    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selected.length} track(s)?`)) {
      try {
        const { deleteTracks } = await import('firebaseServices/firestore');
        await deleteTracks(selected);
        setSelected([]);
        setEditMode(false);
        console.log('Tracks deleted successfully');
      } catch (error) {
        console.error('Error deleting tracks:', error);
        setErrorMessage('Failed to delete tracks. Please try again.');
        setShowErrorDialog(true);
      }
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setSelected([]);
    setExpandedRow(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (tracks?.length || 0)) : 0;

  // In order to add rating also to sort logic
  const computedTracks = useMemo(() => {
    return tracks.map((track) => ({
      ...track,
      rating: averageRatings[track.id] ?? null, 
    }));
  }, [tracks, averageRatings]);
  
  // Apply filters
  const filteredTracks = useMemo(() => {
    return computedTracks.filter((track) => {
      // Genre filter
      if (genreFilter && track.genre !== genreFilter) return false;
      
      // Artist filter
      if (artistFilter && track.artist !== artistFilter) return false;
      
      // Search query (title or tags)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = track.title?.toLowerCase().includes(query);
        const tagsMatch = track.tags?.some(tag => tag.toLowerCase().includes(query));
        if (!titleMatch && !tagsMatch) return false;
      }
      
      // Min rating filter
      if (minRating > 0 && (track.rating === null || track.rating < minRating)) {
        return false;
      }
      
      return true;
    });
  }, [computedTracks, genreFilter, artistFilter, searchQuery, minRating]);
  
  const visibleRows = useMemo(() => {
    return [...filteredTracks]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, filteredTracks]);
  


  return (
    
    <Box sx={{ width: '100%'}}>
      <Paper 
        elevation={0}
        sx={{
          width: '100%',
          borderRadius: '20px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.15)',
          border: '1px solid #e2e8f0',
        }}
      >
        
        <TableContainer sx={{ 
          '&::-webkit-scrollbar': {
            height: '10px',
          },
        }}>
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, borderBottom: '2px solid #e2e8f0', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
          <Box sx={{ flex: 1 }}>
            <TrackFilters
              tracks={computedTracks}
              filtersOpen={filtersOpen}
              setFiltersOpen={setFiltersOpen}
              genreFilter={genreFilter}
              artistFilter={artistFilter}
              searchQuery={searchQuery}
              minRating={minRating}
              setGenreFilter={setGenreFilter}
              setArtistFilter={setArtistFilter}
              setSearchQuery={setSearchQuery}
              setMinRating={setMinRating}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddTrackOpen}
            sx={{ 
              px: 3,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              minWidth: '180px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            + Add New Track
          </Button>
        </Box>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              editMode={editMode}
              numSelected={selected.length}
              rowCount={visibleRows.filter(track => track.added_by_id === user?.uid || user?.role === 'admin').length}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
  {isLoading || !tracks ? (
    <TableRow>
      <TableCell colSpan={7}>
        <Box sx={{ width: '100%', p: 4 }}>
          <Typography variant="h6">Loading songs...</Typography>
        </Box>
      </TableCell>
    </TableRow>
  ) : (
    <>
      {visibleRows.map((track) => {
        const isItemSelected = selected.includes(track.id);
        const canEdit = track.added_by_id === user?.uid || user?.role === 'admin';

        return (
          <React.Fragment key={track.id}>
            <TableRow
              hover
              tabIndex={-1}
              sx={{ 
                cursor: 'pointer',
                '& > *': { borderBottom: expandedRow === track.id ? 'none' : undefined }
              }}
            >
              <TableCell padding="checkbox">
                {editMode ? (
                  <Checkbox
                    color="primary"
                    checked={isItemSelected}
                    disabled={!canEdit}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCheckboxClick(event, track.id, track);
                    }}
                    sx={{
                      opacity: canEdit ? 1 : 0.3,
                    }}
                  />
                ) : (
                  track.permalink && (
                    <Tooltip title="Open in SoundCloud">
                      <IconButton
                        component="a"
                        href={track.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: '#6366f1',
                          '&:hover': {
                            color: '#8b5cf6',
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                  )
                )}
              </TableCell>
              <TableCell padding="checkbox">
                {!editMode && (
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRowClick(event, track.id);
                    }}
                    sx={{
                      transition: 'transform 0.2s',
                      transform: expandedRow === track.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    {expandedRow === track.id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                )}
              </TableCell>
              <TableCell 
                component="th" 
                scope="row" 
                padding="normal" 
                onClick={(event) => {
                  event.stopPropagation();
                  handleRowClick(event, track.id);
                }}
              >
                {track.title}
              </TableCell>
            <TableCell>{track.artist}</TableCell>
            <TableCell align="right">
              {averageRatings[track.id] != null ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ 
                      color: '#fbbf24', 
                      fontSize: '16px',
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                    }}>
                      {i < Math.round(averageRatings[track.id]!) ? '★' : '☆'}
                    </span>
                  ))}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      ml: 1,
                      fontWeight: 600,
                      color: '#64748b',
                    }}
                  >
                    {averageRatings[track.id]!.toFixed(1)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No ratings
                </Typography>
              )}
            </TableCell>
            <TableCell>{track.added_by_name}</TableCell>
          </TableRow>
          {!editMode && (
            <TrackDetailRow
              track={track}
              open={expandedRow === track.id}
              colSpan={headCells.length + 2}
              onClose={() => setExpandedRow(null)}
              setErrorMessage={setErrorMessage}
              setShowErrorDialog={setShowErrorDialog}
            />
          )}
        </React.Fragment>
        );
      })}
      {emptyRows > 0 && (
        <TableRow style={{ height: 53 * emptyRows }}>
          <TableCell colSpan={headCells.length + 2} />
        </TableRow>
      )}
    </>
  )}
</TableBody>

          </Table>
        </TableContainer>
        <TableFooter>
            <TableRow>
              <TableCell 
                colSpan={headCells.length + 2}  
                sx={{ 
                  borderTop: '2px solid #e2e8f0',
                  background: editMode 
                    ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  p: 0,
                }}
              >
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  width: '100%',
                }}>
                  {/* Left side - Edit mode controls or empty */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
                    {editMode && (
                      <>
                        <Typography
                          sx={{ fontWeight: 700, color: '#dc2626' }}
                          variant="subtitle1"
                        >
                          {selected.length} selected
                        </Typography>
                        <Button
                          startIcon={<DeleteIcon />}
                          onClick={handleBulkDelete}
                          disabled={selected.length === 0}
                          color="error"
                          variant="contained"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          Delete Selected
                        </Button>
                        <Button
                          startIcon={<CloseIcon />}
                          onClick={toggleEditMode}
                          sx={{
                            fontWeight: 600,
                            color: '#64748b',
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Box>

                  {/* Center - Pagination */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TablePagination
                      rowsPerPageOptions={[]}
                      component="div"
                      count={filteredTracks ? filteredTracks.length : 0}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                      sx={{
                        border: 'none',
                        '& .MuiTablePagination-toolbar': {
                          minHeight: '52px',
                        }
                      }}
                    />
                  </Box>

                  {/* Right side - Edit button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 2 }}>
                    {!editMode && (user?.role === 'admin' || tracks.some(track => track.added_by_id === user?.uid)) && (
                      <Button
                        variant="text"
                        onClick={toggleEditMode}
                        sx={{
                          color: '#64748b',
                          fontSize: '0.875rem',
                          textTransform: 'none',
                          minWidth: 'auto',
                          '&:hover': {
                            background: 'transparent',
                            color: '#475569',
                          },
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </Box>
                </Box>
              </TableCell>
            </TableRow>
          </TableFooter>
      </Paper>
      <AddSet open={addTrackOpen} handleClickClose={handleAddTrackClose} />
      <ErrorDialog
        open={showErrorDialog}
        onClose={() => {
          setShowErrorDialog(false)
          setErrorMessage('');
        }}
        title="Error"
        message={errorMessage}
        messageType="error"
      />
    </Box>
  );
}
