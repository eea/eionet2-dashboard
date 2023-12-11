import { React, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, IconButton, Dialog } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { FullCircularProgress } from './FullCircularProgress';

export function ProgressGauge({ totalCount, responseCount, label, infoText }) {
  const [infoOpen, setInfoOpen] = useState(false),
    handleInfoOpen = () => {
      infoText && setInfoOpen(true);
    },
    handleInfoClose = () => {
      setInfoOpen(false);
    };

  return (
    <Card variant="outlined" className="indicator-card">
      <Dialog open={infoOpen} onClose={handleInfoClose} maxWidth="xl">
        <Typography sx={{ padding: '1rem' }} color="secondary">
          {infoText}
        </Typography>
        <Button
          onClick={handleInfoClose}
          sx={{ alignSelf: 'end', marginRight: '0.5rem', marginBottom: '0.5rem' }}
        >
          Close
        </Button>
      </Dialog>

      <CardContent className="card-content">
        <IconButton
          onClick={handleInfoOpen}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <HelpOutlineIcon />
        </IconButton>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <FullCircularProgress
            totalCount={totalCount}
            responseCount={responseCount}
          ></FullCircularProgress>
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{ fontSize: '28px', fontWeight: '600' }}
              variant="caption"
              component="div"
              color="primary"
            >
              {responseCount}
            </Typography>
            <Typography
              sx={{ fontSize: '28px', fontWeight: '400' }}
              variant="caption"
              component="div"
              color="primary"
            >
              /{totalCount}
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{
            textAlign: 'center',
            marginTop: '1rem',
            width: '150px',
            height: '1rem',
            fontSize: '20px',
          }}
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
