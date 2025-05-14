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
import { subscribeToTracks , subscribeToAverageRating } from 'firebaseServices/firestore';
// import { useAuth } from 'components/AuthProvider';
import ErrorDialog from './ErrorDialog';
import SmallSidebar from './SidebarTrack';
import { SIDEBAR_WIDTH } from 'utils/constants';

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
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
      ]}
    >
      <Typography sx={{ flex: '1 1 100%' }}>
        Sets and Tracks
      </Typography>
    </Toolbar>
  );
}

export default function SongsTable() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [tracks, setTracks] = useState<Track[] | []>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState<Error | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Track>('title');
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [addTrackOpen, setAddTrackOpen] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // const { user } = useAuth();
  useEffect(() => {
    const unsubscribe = subscribeToTracks(setTracks, setIsLoading, setError);

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount
  
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

  const visibleRows = useMemo(
    () =>
      [...(tracks ?? [])]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, tracks]
  );


  return (
    
    <Box sx={{ width: '100%', display: 'flex'}}>
      <Paper sx={{
        width: openSidebar ? `calc(100% - 300px)` : '100%',
        marginRight: openSidebar ? {SIDEBAR_WIDTH} : '0px',
      }}>
        <EnhancedTableToolbar />
        <TableContainer>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: 'black', fontSize: '14px' }}>
                      {i < Math.round(averageRatings[track.id]!) ? '★' : '☆'}
                    </span>
                  ))}
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {averageRatings[track.id]!.toFixed(1)}
                  </Typography>
                </Box>
              ) : (
                'No ratings'
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
      >
        <LinkIcon />
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
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTrackOpen}
                  sx={{ ml: 2 }}
                >
                  Add New Track
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
        </TableContainer>
      </Paper>
      <AddSet open={addTrackOpen} handleClickClose={handleAddTrackClose} />
      <ErrorDialog
        open={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
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
        />
    </Box>
  );
}
