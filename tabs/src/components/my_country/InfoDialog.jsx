import React from 'react';
import {
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export function InfoDialog({ open, onClose, infoText, dialogTitle, dialogContent }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth={!!dialogContent}>
      <IconButton
        aria-label="close"
        onClick={onClose}
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
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
