import { React } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export function ProgressBar({ totalCount, responseCount, label }) {
  const valueProgress = (responseCount / totalCount) * 100;
  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'row', width: '50%', padding: '0.3rem' }}>
        <Typography sx={{ width: '150px', marginRight: '0.1rem', fontSize: 'larger' }}>
          {label}
        </Typography>
        <LinearProgress
          variant="buffer"
          sx={{ height: '32px', flex: 1 }}
          value={valueProgress > 0 ? valueProgress : 46}
        ></LinearProgress>
      </Box>
    </div>
  );
}
