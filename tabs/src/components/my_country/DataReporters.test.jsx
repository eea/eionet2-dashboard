import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { DataReporters } from './DataReporters';

jest.mock('../../data/reportingProvider', () => ({
  getFlows: jest.fn(),
}));
jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
}));
jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));
jest.mock('@mui/x-data-grid', () => ({
  GridToolbarContainer: ({ children }) => <div>{children}</div>,
  GridToolbarFilterButton: () => <button>filter</button>,
  GridToolbarExport: () => <button>export</button>,
}));

describe('DataReporters', () => {
  test('renders coordinator text and grid', () => {
    const html = renderToStaticMarkup(
      <DataReporters
        configuration={{
          DataflowCoordinatorsTag: 'Coordinator',
          ReportingInfoText: 'Reporting info',
          DateFormatDashboard: 'dd-MMM-yyyy',
        }}
        country="RO"
        users={[{ Title: 'John Doe', AllMemberships: ['Coordinator'] }]}
      />,
    );

    expect(html).toContain('National Dataflow Coordinator: John Doe');
    expect(html).toContain('Reporting info');
    expect(html).toContain('grid-rows-0');
  });
});
