import * as React from 'react';
import { useState, useEffect, useMemo } from 'react'; // Import useEffect and useState
// import ReactPlayer from 'react-player';
import { Track} from 'types/track';
// import songs from 'data/songs.json';
// import SoundCloudPlayer from 'components/SoundCloudPlayer';
import { alpha } from '@mui/material/styles';
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
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { Button, TableFooter } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

import AddSet from './AddSet';
import { subscribeToTracks, deleteTracks , getTracksFromIds} from 'firebaseServices/firestore';
import { useAuth } from 'components/AuthProvider';
import ErrorDialog from './ErrorDialog';


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
    id: 'release_date',
    numeric: false,
    disablePadding: false,
    label: 'Release Date',
  },
  {
    id: 'publish_date',
    numeric: false,
    disablePadding: false,
    label: 'Publish Date',
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
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Track) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
  const createSortHandler = (property: keyof Track) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all songs',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
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

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDeleteSelected: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  // This is for the selecting of tracks, deleting and filtering button
  const { numSelected, handleDeleteSelected} = props;

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Sets and Tracks
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton>
            <DeleteIcon onClick={() => handleDeleteSelected()} color="error"  />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default function SongsTable() {
  const [tracks, setTracks] = useState<Track[] | []>([]);
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

  const { user } = useAuth();
  useEffect(() => {
    const unsubscribe = subscribeToTracks(setTracks, setIsLoading, setError);

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

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

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tracks ? tracks.map((n: Track) => n.id) : [];
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent<unknown>, id: string) => {
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
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSelected = async () => {
    setIsLoading(true); // Show loading indicator
    const selectedTracks = await getTracksFromIds(selected); // Fetch the selected tracks
    const allTracksAddedByUser = selectedTracks.every((track) => track.added_by_id === user?.uid);
    

    try {
      if (allTracksAddedByUser || user?.role === 'admin') {
        await deleteTracks(selected);
        setSelected([]); // Clear selected track IDs after deletion
      } else {
        setErrorMessage('You can only delete tracks that you yourself have added.');
        setShowErrorDialog(true);
      }
    } catch (error: any) {
      console.error('Error deleting tracks:', error);
      setError(error); // Set error state to display error message
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
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
    
    <Box sx={{ width: '100%' }}>
      {/* <SoundCloudPlayer
        src="https://soundcloud.com/billieeilish/birds-of-a-feather?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
        /> */}
      {/* <ReactPlayer url='https://soundcloud.com/glennmorrison/beethoven-moonlight-sonata' /> */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} handleDeleteSelected={handleDeleteSelected} />
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={tracks ? tracks.length : 0}
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
          >
            <TableCell padding="checkbox">
              <Checkbox
                color="primary"
                checked={isItemSelected}
                inputProps={{
                  'aria-labelledby': labelId,
                }}
                onClick={(event) => handleClick(event, track.id)}
              />
            </TableCell>
            <TableCell component="th" id={labelId} scope="row" padding="none">
              {track.title}
            </TableCell>
            <TableCell>{track.artist}</TableCell>
            {/* <TableCell>{track.album}</TableCell> */}
            <TableCell>{track.release_date}</TableCell>
            <TableCell>{track.publish_date}</TableCell>
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
    </Box>
  );
}
