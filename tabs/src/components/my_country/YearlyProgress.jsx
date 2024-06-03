import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressGauge } from './ProgressGauge';

export function YearlyProgress({ yearData, configuration }) {
  return (
    <div className="">
      <Typography className="subtitle" color="text.secondary">
        Participation:
      </Typography>
      <Box className="cards-container" sx={{ border: '0px' }}>
        <ProgressGauge
          label="Consultations"
          totalCount={yearData.consultationsCount}
          responseCount={yearData.responseConsultationsCount}
          infoText={configuration.YearlyConsultationsCountInfo}
          url={yearData.consultationsUrl}
        ></ProgressGauge>
        <ProgressGauge
          label="Enquiries"
          totalCount={yearData.surveysCount}
          responseCount={yearData.responseSurveysCount}
          infoText={configuration.YearlySurveysCountInfo}
          url={yearData.surveysUrl}
        ></ProgressGauge>
        <ProgressGauge
          label="Events"
          totalCount={yearData.meetingsCount}
          responseCount={yearData.attendedMeetingsCount}
          infoText={configuration.YearlyEventsCountInfo}
          url={yearData.meetingsUrl}
        ></ProgressGauge>
      </Box>
    </div>
  );
}
