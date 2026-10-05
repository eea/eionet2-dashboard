import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

import { FullCircularProgress } from './FullCircularProgress';

export function ProgressGauge({
  totalCount,
  responseCount,
  label,
  infoText,
  dialogTitle,
  dialogContent,
}) {
  const [infoOpen, setInfoOpen] = useState(false),
    handleInfoOpen = () => {
      (infoText || dialogContent) && setInfoOpen(true);
    },
    handleInfoClose = () => {
      setInfoOpen(false);
    };

  return (
    <Card variant="outlined" className="indicator-card">
      <Dialog open={infoOpen} onClose={handleInfoClose} maxWidth="xl" fullWidth={!!dialogContent}>
        <IconButton
          aria-label="close"
          onClick={handleInfoClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            zIndex: 1,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {dialogTitle && <DialogTitle>{dialogTitle}</DialogTitle>}
        <DialogContent>
          {infoText && (
            <Typography sx={{ paddingBottom: '1rem' }} color="secondary">
              {infoText}
            </Typography>
          )}
          {dialogContent}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <CardContent className="card-content">
        <IconButton
          onClick={handleInfoOpen}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            //the progress circles below use z-index up to 2
            zIndex: 3,
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
          variant="body1"
          component="div"
        >
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
