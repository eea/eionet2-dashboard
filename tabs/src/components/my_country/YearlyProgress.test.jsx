import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { YearlyProgress } from './YearlyProgress';

describe('YearlyProgress', () => {
  test('renders participation header and three gauge labels', () => {
    const html = renderToStaticMarkup(
      <YearlyProgress
        yearData={{
          consultationsCount: 10,
          responseConsultationsCount: 5,
          surveysCount: 8,
          responseSurveysCount: 4,
          meetingsCount: 6,
          attendedMeetingsCount: 3,
        }}
        configuration={{
          YearlyConsultationsCountInfo: 'c',
          YearlySurveysCountInfo: 's',
          YearlyEventsCountInfo: 'e',
        }}
      />,
    );

    expect(html).toContain('Participation:');
    expect(html).toContain('Consultations');
    expect(html).toContain('Enquiries');
    expect(html).toContain('Events');
  });
});
