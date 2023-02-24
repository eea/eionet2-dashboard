import { React } from 'react';
import { Box } from '@mui/material';
import { ProgressBar } from './ProgressBar';

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
      return meeting.Participants.some((participant) => participant.fields.Countries == country);
    });
  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <ProgressBar
          label="Consultations"
          totalCount={allConsultations.length}
          responseCount={responseConsultations.length}
          url={
            configuration.ConsultationListUrl +
            '?FilterField1=ConsultationType&FilterValue1=Consultation'
          }
        ></ProgressBar>
        <ProgressBar
          label="Inquiries"
          totalCount={allSurveys.length}
          responseCount={responseSurveys.length}
          url={
            configuration.ConsultationListUrl +
            '?FilterField1=ConsultationType&FilterValue1=Inquiry'
          }
        ></ProgressBar>
        <ProgressBar
          label="Events"
          totalCount={meetings.length}
          responseCount={attendedMeetings.length}
          url={configuration.MeetingListUrl}
        ></ProgressBar>
      </Box>
    </div>
  );
}
