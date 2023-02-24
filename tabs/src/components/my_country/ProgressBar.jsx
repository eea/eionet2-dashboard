import { React } from 'react';
import { Box, LinearProgress, Button, Typography } from '@mui/material';

export function ProgressBar({ totalCount, responseCount, label, url }) {
  const originalValue = (responseCount / totalCount) * 100,
    valueProgress = isNaN(originalValue) ? 0 : originalValue;
  return (
    <Box className="progress-bar">
      <Typography sx={{ width: '150px', marginRight: '0.1rem', fontSize: 'larger' }}>
        {label}
      </Typography>
      <LinearProgress
        variant="determinate"
        sx={{ flex: 1, height: 10, borderRadius: 5, alignSelf: 'center' }}
        value={valueProgress}
      ></LinearProgress>
      <Typography
        sx={{ width: '100px', marginLeft: '0.5rem', fontSize: 'larger', alignSelf: 'center' }}
      >
        {valueProgress.toFixed(0)}%
      </Typography>
      <Button
        sx={{ borderRadius: '5px' }}
        variant="outlined"
        onClick={() => {
          window.open(url, '_blank');
        }}
      >
        See details
      </Button>
    </Box>
  );
}
