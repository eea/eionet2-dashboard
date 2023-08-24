import { React } from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressGauge } from './ProgressGauge';

export function YearlyProgress({ meetings, consultations, country, configuration }) {
  const allConsultations = consultations.filter((c) => {
      return c.ConsultationType == 'Consultation';
    }),
    responseConsultations = allConsultations.filter((c) => {
      return c.Respondants.includes(country);
    }),
    allSurveys = consultations.filter((c) => {
      return c.ConsultationType == 'Inquiry';
    }),
    responseSurveys = allSurveys.filter((c) => {
      return c.Respondants.includes(country);
    }),
    attendedMeetings = meetings.filter((meeting) => {
      return meeting.Participants.some((participant) => participant.Country == country);
    });
  return (
    <div className="">
      <Typography sx={{ fontSize: '16px', fontWeight: '600' }} color="text.secondary">
        Participation:
      </Typography>
      <Box className="cards-container" sx={{ border: '0px' }}>
        <ProgressGauge
          label="Consultations"
          totalCount={allConsultations.length}
          responseCount={responseConsultations.length}
          infoText={configuration.YearlyConsultationsCountInfo}
        ></ProgressGauge>
        <ProgressGauge
          label="Inquiries"
          totalCount={allSurveys.length}
          responseCount={responseSurveys.length}
          infoText={configuration.YearlySurveysCountInfo}
        ></ProgressGauge>
        <ProgressGauge
          label="Events"
          totalCount={meetings.length}
          responseCount={attendedMeetings.length}
          infoText={configuration.YearlyEventsCountInfo}
        ></ProgressGauge>
      </Box>
    </div>
  );
}
