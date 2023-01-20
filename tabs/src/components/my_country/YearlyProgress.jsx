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
      return c.ConsultationType == 'Survey';
    }),
    responseSurveys = allSurveys.filter((c) => {
      return c.Respondants.includes(country);
    }),
    attendedMeetings = meetings.filter((meeting) => {
      return meeting.Participants.some((participant) => participant.fields.Countries == country);
    });
  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '80%' }}>
        <ProgressBar
          label="Consultations"
          totalCount={allConsultations.length}
          responseCount={responseConsultations.length}
          url={
            configuration.ConsultationListUrl +
            '?FilterField1=ConsultationType&FilterValue1=Consultation'
          }
        ></ProgressBar>
        {false && (
          <ProgressBar
            label="Data flows"
            totalCount={20}
            responseCount={5}
            url="http://google.ro"
          ></ProgressBar>
        )}
        <ProgressBar
          label="Surveys"
          totalCount={allSurveys.length}
          responseCount={responseSurveys.length}
          url={
            configuration.ConsultationListUrl + '?FilterField1=ConsultationType&FilterValue1=Survey'
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
