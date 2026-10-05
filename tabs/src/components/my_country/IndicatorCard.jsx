import React, { useState } from 'react';
import {
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Button,
  IconButton,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';

export function IndicatorCard({ labelText, valueText, url, infoText, dialogTitle, dialogContent }) {
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
        <Typography className="card-value" color="primary" variant="h1" component="div">
          {valueText}
        </Typography>
        <Typography className="card-label">{labelText}</Typography>
        <IconButton
          onClick={handleInfoOpen}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <HelpOutlineIcon />
        </IconButton>
      </CardContent>
      {url && (
        <Link
          sx={{ color: 'text.main' }}
          className="card-details"
          component="button"
          variant="body1"
          onClick={() => {
            window.open(url, '_blank');
          }}
        >
          {'Details'}
        </Link>
      )}
    </Card>
  );
}
