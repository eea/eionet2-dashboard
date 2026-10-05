import React, { useState } from 'react';
import { Typography, Card, CardContent, Link, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { InfoDialog } from './InfoDialog';

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
      <InfoDialog
        open={infoOpen}
        onClose={handleInfoClose}
        infoText={infoText}
        dialogTitle={dialogTitle}
        dialogContent={dialogContent}
      />
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
