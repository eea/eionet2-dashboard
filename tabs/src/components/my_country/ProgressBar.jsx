import { React } from 'react';
import { Box, LinearProgress, Link, Typography } from '@mui/material';

export function ProgressBar({ totalCount, responseCount, label, url }) {
  const originalValue = (responseCount / totalCount) * 100,
    valueProgress = isNaN(originalValue) ? 0 : originalValue;
  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '50%', padding: '0.3rem' }}>
        <Typography sx={{ width: '150px', marginRight: '0.1rem', fontSize: 'larger' }}>
          {label}
        </Typography>
        <LinearProgress
          variant="determinate"
          sx={{ height: '32px', flex: 1 }}
          value={valueProgress}
        ></LinearProgress>
        <Typography sx={{ width: '150px', marginLeft: '0.5rem', fontSize: 'larger' }}>
          {valueProgress.toFixed(2)}%
        </Typography>
        <Link sx={{ fontSize: 'larger', }}
          component="button"
          variant="body1"
          onClick={() => {
            window.open(url, '_blank');
          }}
        >
          See details
        </Link>
      </Box>
    </div>
  );
}
