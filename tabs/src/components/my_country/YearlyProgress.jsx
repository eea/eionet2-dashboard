import { React } from 'react';
import { Box } from '@mui/material';
import { ProgressBar } from './ProgressBar';

export function YearlyProgress({ meetings, consultations, country }) {
  const responseConsultations = consultations.filter((c) => {
      return c.Respondants.contains(country) && c.Enddate && c.ConsultationType == 'Consultation';
    }),
    responseSurveys = consultations.filter((c) => {
      return c.Respondants.contains(country) && c.Enddate && c.ConsultationType == 'Survey';
    });
  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '80%' }}>
        <ProgressBar
          label="Consultations"
          value={
            (responseConsultations.length /
              consultations.filter((c) => {
                c.ConsultationType == 'Consultation';
              }).length) *
            100
          }
        ></ProgressBar>
        <ProgressBar label="Data flows" value="50"></ProgressBar>
        <ProgressBar
          label="Surveys"
          value={
            (responseSurveys.length /
              consultations.filter((c) => {
                c.ConsultationType == 'Survey';
              }).length) *
            100
          }
        ></ProgressBar>
        <ProgressBar label="Events" value={50 + meetings.length}></ProgressBar>
      </Box>
    </div>
  );
}
