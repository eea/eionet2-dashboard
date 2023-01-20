import { React } from 'react';
import { Typography, Card, CardContent, Link } from '@mui/material';

export function IndicatorCard({ labelText, valueText, textColor, url }) {
  return (
    <Card variant="outlined" className="indicator-card">
      <CardContent>
        {url && (
          <Link
            sx={{ fontSize: 16, height: '40px' }}
            component="button"
            variant="body1"
            onClick={() => {
              window.open(url, '_blank');
            }}
          >
            {labelText}
          </Link>
        )}
        {!url && (
          <Typography sx={{ fontSize: 16, height: '40px' }} color="text.secondary">
            {labelText}
          </Typography>
        )}
        <Typography
          sx={{ paddingTop: '1rem' }}
          className="three-d-text"
          variant="h1"
          component="div"
          color={textColor}
        >
          {valueText}
        </Typography>
      </CardContent>
    </Card>
  );
}
