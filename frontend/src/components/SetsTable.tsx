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
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';
import { Button, TableFooter } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

import AddSet from './AddSet';
import {
  // subscribeToTracks,
  subscribeToAverageRating, subscribeToTracksByGroupId
} from 'firebaseServices/firestore';
// import { useAuth } from 'components/AuthProvider';
import ErrorDialog from './ErrorDialog';
import SmallSidebar from './SidebarTrack';
import { SIDEBAR_WIDTH } from 'utils/constants';
import { useAuth } from './AuthProvider';

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
    id: 'publish_date',
    numeric: false,
    disablePadding: false,
    label: 'Publish Date',
  },
  {
    id: 'rating',
    numeric: true,
    disablePadding: false,
    label: 'Rating',
  },
  {
    id: 'genre',
    numeric: false,
    disablePadding: false,
    label: 'Genre',
  },
  {
    id: 'likes',
    numeric: true,
    disablePadding: false,
    label: 'Likes',
  },
  {
    id: 'playbacks',
    numeric: true,
    disablePadding: false,
    label: 'Playbacks',
  },
  {
    id: 'permalink',
    numeric: false,
    disablePadding: false,
    label: 'Link',
  },
  {
    id: 'tags',
    numeric: false,
    disablePadding: false,
    label: 'Tags',
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
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Track) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>

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


function EnhancedTableToolbar() {
  // This is for the selecting of tracks, deleting and filtering button

  return (
    <Toolbar
      sx={{
        pl: { sm: 3 },
        pr: { xs: 2, sm: 2 },
        py: 2,
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderBottom: '2px solid #e2e8f0',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 700,
            color: '#1e293b',
            letterSpacing: '-0.01em',
          }}
        >
          Sets and Tracks
        </Typography>
      </Box>
    </Toolbar>
  );
}

export default function SongsTable() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [tracks, setTracks] = useState<Track[] | []>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Track>('title');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { activeGroupId } = useAuth();

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

  const handleClick = (_event: React.MouseEvent<unknown>, id: string) => {
    setSelected([id]);
    setOpenSidebar(true);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - (tracks?.length || 0)) : 0;

  // In order to add rating also to sort logic
  const computedTracks = useMemo(() => {
    return tracks.map((track) => ({
      ...track,
      rating: averageRatings[track.id] ?? null, 
    }));
  }, [tracks, averageRatings]);
  
  const visibleRows = useMemo(() => {
    return [...computedTracks]
      .sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [order, orderBy, page, rowsPerPage, computedTracks]);
  


  return (
    
    <Box sx={{ width: '100%', display: 'flex'}}>
      <Paper 
        elevation={0}
        sx={{
          width: openSidebar ? `calc(100% - 300px)` : '100%',
          marginRight: openSidebar ? {SIDEBAR_WIDTH} : '0px',
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
        <EnhancedTableToolbar />
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
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
      {visibleRows.map((track, index) => {
        const isItemSelected = selected.includes(track.id);
        const labelId = `enhanced-table-checkbox-${index}`;

        return (
          <TableRow
            hover
            role="checkbox"
            aria-checked={isItemSelected}
            tabIndex={-1}
            key={track.id}
            selected={isItemSelected}
            sx={{ cursor: 'pointer' }}
            onClick={(event) => handleClick(event, track.id)}
          >
            <TableCell component="th" id={labelId} scope="row" padding="normal" onClick={() => setOpenSidebar(true)}>
              {track.title}
            </TableCell>
            <TableCell>{track.artist}</TableCell>
            <TableCell>{track.publish_date}</TableCell>
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
            <TableCell>{track.genre}</TableCell>
            <TableCell align="right">{track.likes}</TableCell>
            <TableCell align="right">{track.playbacks}</TableCell>
            <TableCell align='left'>
            {track.permalink && (
    <Tooltip title="Open link in new tab">
      <a
        href={track.permalink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <LinkIcon sx={{ 
          color: '#6366f1',
          '&:hover': {
            color: '#8b5cf6',
            transform: 'scale(1.1)',
          },
        }} />
      </a>
    </Tooltip>
  )}
</TableCell>
            <TableCell sx={{ width: 100, whiteSpace: 'pre-line' }}>
              {track.tags ? track.tags.join('\n') : ''}
            </TableCell>
            <TableCell>{track.added_by_name}</TableCell>
          </TableRow>
        );
      })}
      {emptyRows > 0 && (
        <TableRow style={{ height: 53 * emptyRows }}>
          <TableCell colSpan={7} />
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
                colSpan={headCells.length}  
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderTop: '2px solid #e2e8f0',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  py: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTrackOpen}
                  sx={{ 
                    ml: 2,
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
                    },
                  }}
                >
                  + Add New Track
                </Button>

                <TablePagination
                  sx={{ flexShrink: 0, ml: 2 }}
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={tracks ? tracks.length : 0}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
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
      <SmallSidebar
        trackId={selected.length > 0 ? selected[0] : ''}
        open={openSidebar}
        setOpen={setOpenSidebar}
        setErrorMessage={setErrorMessage}
        setShowErrorDialog={setShowErrorDialog}
        setSelected={setSelected}
        />
    </Box>
  );
}
