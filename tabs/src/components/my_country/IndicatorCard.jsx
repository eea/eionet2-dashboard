import { React, useState } from 'react';
import { Typography, Card, CardContent, Dialog, Link, Button, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export function IndicatorCard({ labelText, valueText, url, infoText }) {
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
        <Typography className="card-value" color="primary" variant="h1" component="div">
          {valueText}
        </Typography>
        <Typography className="card-label" color="secondary">
          {labelText}
        </Typography>
        <IconButton
          onClick={handleInfoOpen}
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <InfoIcon />
        </IconButton>
      </CardContent>
      {url && (
        <Link
          className="card-details"
          component="button"
          variant="body1"
          onClick={() => {
            window.open(url, '_blank');
          }}
        >
          {'SEE DETAILS'}
        </Link>
      )}
    </Card>
  );
}
