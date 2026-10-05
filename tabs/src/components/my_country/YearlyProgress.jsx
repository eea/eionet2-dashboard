import React from 'react';
import { Box, Typography } from '@mui/material';
import { ProgressGauge } from './ProgressGauge';
import { CardColumns } from './CardColumns';

export function YearlyProgress({ yearData, configuration }) {
  const dateFormat = configuration.DateFormatDashboard,
    renderColumns = (columns) => {
      return <CardColumns columns={columns} dateFormat={dateFormat}></CardColumns>;
    };

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
          dialogTitle={`Consultations ${yearData.year}`}
          dialogContent={renderColumns([
            { title: 'Responded', items: yearData.respondedConsultations },
            { title: 'Not responded', items: yearData.notRespondedConsultations },
          ])}
        ></ProgressGauge>
        <ProgressGauge
          label="Enquiries"
          totalCount={yearData.surveysCount}
          responseCount={yearData.responseSurveysCount}
          infoText={configuration.YearlySurveysCountInfo}
          dialogTitle={`Enquiries ${yearData.year}`}
          dialogContent={renderColumns([
            { title: 'Responded', items: yearData.respondedSurveys },
            { title: 'Not responded', items: yearData.notRespondedSurveys },
          ])}
        ></ProgressGauge>
        <ProgressGauge
          label="Events"
          totalCount={yearData.meetingsCount}
          responseCount={yearData.attendedMeetingsCount}
          infoText={configuration.YearlyEventsCountInfo}
          dialogTitle={`Events ${yearData.year}`}
          dialogContent={renderColumns([
            { title: 'Events participated', items: yearData.attendedMeetings },
            { title: 'Events not participated', items: yearData.notAttendedMeetings },
          ])}
        ></ProgressGauge>
      </Box>
    </div>
  );
}
