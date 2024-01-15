import { React } from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressGauge } from './ProgressGauge';

export function YearlyProgress({
  allMeetingsCount,
  attendedMeetingsCount,
  allConsultationsCount,
  responseConsultationsCount,
  allSurveysCount,
  responseSurveysCount,
  configuration,
}) {
  return (
    <div className="">
      <Typography className="subtitle" color="text.secondary">
        Participation:
      </Typography>
      <Box className="cards-container" sx={{ border: '0px' }}>
        <ProgressGauge
          label="Consultations"
          totalCount={allConsultationsCount}
          responseCount={responseConsultationsCount}
          infoText={configuration.YearlyConsultationsCountInfo}
        ></ProgressGauge>
        <ProgressGauge
          label="Enquiries"
          totalCount={allSurveysCount}
          responseCount={responseSurveysCount}
          infoText={configuration.YearlySurveysCountInfo}
        ></ProgressGauge>
        <ProgressGauge
          label="Events"
          totalCount={allMeetingsCount}
          responseCount={attendedMeetingsCount}
          infoText={configuration.YearlyEventsCountInfo}
        ></ProgressGauge>
      </Box>
    </div>
  );
}
