import { React, useState } from 'react';
import { Typography, Card, CardContent, Dialog, Link, Button, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
        <Typography className="card-label" >
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
          <HelpOutlineIcon />
        </IconButton>
      </CardContent>
      {url && (
        <Link sx={{ color: "text.main" }}
          className="card-details"
          color="secondary"
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
