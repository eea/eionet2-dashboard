import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ObligationList } from './ObligationList';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
}));

jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));

describe('ObligationList', () => {
  test('renders intro text and upcoming obligations grid for tab 0', () => {
    const html = renderToStaticMarkup(
      <ObligationList
        userInfo={{}}
        configuration={{
          DateFormatDashboard: 'dd-MMM-yyyy',
          ReportingObligationsIntroText: 'Reporting intro',
        }}
        upcomingObligations={[{ id: 1, Title: 'Upcoming' }]}
        continuousObligations={[]}
        tabsValue={0}
      />,
    );

    expect(html).toContain('Reporting intro');
    expect(html).toContain('grid-rows-1');
  });

  test('renders continuous obligations grid for tab 1', () => {
    const html = renderToStaticMarkup(
      <ObligationList
        userInfo={{}}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        upcomingObligations={[]}
        continuousObligations={[{ id: 1, Title: 'Continuous' }]}
        tabsValue={1}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });
});
