import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
// import List from '@mui/material/List';
// import Divider from '@mui/material/Divider';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import InboxIcon from '@mui/icons-material/MoveToInbox';
// import MailIcon from '@mui/icons-material/Mail';

import SongForm from './AddSet';

export default function AddSetDrawer(props: { open: boolean; setOpen: (open: boolean) => void }) {
    const { open, setOpen } = props;
    {

        const toggleDrawer = (newOpen: boolean) => () => {
            setOpen(newOpen);
        };

        const DrawerList = (
            <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
                <SongForm />
            </Box>
        );

        return (
            <div>
                <Button onClick={toggleDrawer(true)}>Open drawer</Button>
                <Drawer open={open} onClose={toggleDrawer(false)} anchor='right'>
                    {DrawerList}
                </Drawer>
            </div>
        );
    }
}
