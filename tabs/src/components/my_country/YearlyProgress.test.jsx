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
          consultationsUrl: 'https://example.org/c',
          surveysCount: 8,
          responseSurveysCount: 4,
          surveysUrl: 'https://example.org/s',
          meetingsCount: 6,
          attendedMeetingsCount: 3,
          meetingsUrl: 'https://example.org/m',
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
