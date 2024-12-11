import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useConfiguration } from '../data/hooks/useConfiguration';

export function EventDialogTitle({ title, event }) {
  const configuration = useConfiguration(),
    [longDateFormat, setLongDateFormat] = useState(undefined);

  useEffect(() => {
    configuration.DateFormatDashboard &&
      setLongDateFormat(configuration.DateFormatDashboard + ' HH:mm');
  }, [configuration]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="h5">Event: {event.Title}</Typography>
      {longDateFormat && (
        <Typography variant="subtitle2">
          {event.MeetingStart && format(event.MeetingStart, longDateFormat)} -{' '}
          {event.MeetingEnd && format(event.MeetingEnd, longDateFormat)}
        </Typography>
      )}
    </Box>
  );
}
