import { React } from 'react';
import { Typography, Card, CardContent } from '@mui/material';

export function IndicatorCard({ labelText, valueText, textColor }) {
  return (
    <Card variant="outlined" sx={{ width: 200, margin: '1rem', boxShadow: '5px 5px lightblue' }}>
      <CardContent>
        <Typography sx={{ fontSize: 16, height: '40px' }} color="text.secondary">
          {labelText}
        </Typography>
        <Typography variant="h1" component="div" color={textColor}>
          {valueText}
        </Typography>
      </CardContent>
    </Card>
  );
}
