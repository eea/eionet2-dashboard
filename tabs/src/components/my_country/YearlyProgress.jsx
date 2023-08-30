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
      <Typography sx={{ fontSize: '16px', fontWeight: '600' }} color="text.secondary">
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
          label="Inquiries"
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
