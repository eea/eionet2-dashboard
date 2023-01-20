import ConstructionIcon from '@mui/icons-material/Construction';
import { React, } from 'react';
import { Box, Typography } from '@mui/material';


export function UnderConstruction() {
    return (
        <Box sx={{ boxShadow: '2', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', justifyContent: 'start', padding: '5rem' }}>
            <ConstructionIcon sx={{ fontSize: '10rem', width: '100%', }}>
            </ConstructionIcon>
            <Typography sx={{ fontSize: 'larger', textAlign: 'center', }}>
                Page under construction
            </Typography>
        </Box>
    );
}
