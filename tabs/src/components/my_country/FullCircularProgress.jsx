import { React } from 'react';
import { Box, CircularProgress } from '@mui/material';

export function FullCircularProgress({ totalCount, responseCount }) {
  const originalValue = (responseCount / totalCount) * 100,
    valueProgress = isNaN(originalValue) ? 0 : originalValue;

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        sx={{ position: 'relative', zIndex: 2 }}
        size={150}
        variant="determinate"
        value={valueProgress}
        thickness={6}
      />
      <CircularProgress
        sx={{
          position: 'absolute',
          zIndex: 1,
          right: 0,
          color: (theme) => theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
        }}
        size={150}
        variant="determinate"
        value={100}
        thickness={6}
      />
    </Box>
  );
}
