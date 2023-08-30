import { React } from 'react';
import { Dialog, DialogTitle, IconButton } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { EventRating } from '../event_rating/EventRating';
import { EventDialogTitle } from '../EventDialogTitle';

import { useConfiguration } from '../../data/hooks/useConfiguration';

export function EventRatingDialog({ open, handleClose, event, participant }) {
  const configuration = useConfiguration();
  return (
    <Dialog
      className="dialog"
      open={open}
      onClose={() => handleClose(false)}
      maxWidth="md"
      fullWidth
    >
      {event && (
        <DialogTitle>
          <IconButton
            aria-label="close"
            onClick={() => handleClose(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <EventDialogTitle title={'RATING OF THE EVENT'} event={event}></EventDialogTitle>
        </DialogTitle>
      )}
      <EventRating
        configuration={configuration}
        event={event}
        participant={participant}
        onRate={handleClose}
      ></EventRating>
    </Dialog>
  );
}
