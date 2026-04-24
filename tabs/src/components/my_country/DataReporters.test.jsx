import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { DataReporters } from './DataReporters';
import { getFlows } from '../../data/reportingProvider';

jest.mock('../../data/reportingProvider', () => ({
  getFlows: jest.fn(),
}));

const mockResizableGrid = jest.fn(({ rows }) => <div>grid-rows-{rows?.length || 0}</div>);
jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: (props) => mockResizableGrid(props),
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
  beforeEach(() => {
    jest.clearAllMocks();
    global.window = { open: jest.fn() };
  });

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

  test('returns empty output when country is missing', () => {
    const html = renderToStaticMarkup(
      <DataReporters
        configuration={{
          DataflowCoordinatorsTag: 'Coordinator',
          ReportingInfoText: 'Reporting info',
        }}
        country=""
        users={[]}
      />,
    );

    expect(html).toBe('');
    expect(mockResizableGrid).not.toHaveBeenCalled();
  });

  test('configures toolbar and column renderers', () => {
    renderToStaticMarkup(
      <DataReporters
        configuration={{
          DataflowCoordinatorsTag: 'Coordinator',
          ReportingInfoText: 'Reporting info',
          DateFormatDashboard: 'dd-MMM-yyyy',
        }}
        country="RO"
        users={[]}
      />,
    );

    const gridProps = mockResizableGrid.mock.calls[0][0];
    expect(gridProps.pageSizeOptions).toEqual([25, 50, 100]);
    expect(gridProps.hideFooterSelectedRowCount).toBe(true);
    expect(gridProps.initialState.pagination.paginationModel.pageSize).toBe(25);
    expect(gridProps.initialState.sorting.sortModel[0]).toEqual({
      field: 'firstReleaseDate',
      sort: 'desc',
    });
    expect(gridProps.getRowHeight()).toBe('auto');

    const toolbarHtml = renderToStaticMarkup(<gridProps.slots.toolbar />);
    expect(toolbarHtml).toContain('filter');
    expect(toolbarHtml).toContain('export');

    const titleColumn = gridProps.columns.find((c) => c.field === 'dataflowName');
    const reportersColumn = gridProps.columns.find((c) => c.field === 'reporterEmailsString');
    const deadlineColumn = gridProps.columns.find((c) => c.field === 'deadlineDate');
    const releaseColumn = gridProps.columns.find((c) => c.field === 'firstReleaseDate');
    const statusColumn = gridProps.columns.find((c) => c.field === 'status');
    const deliveryColumn = gridProps.columns.find((c) => c.field === 'deliveryStatus');
    const coreColumn = gridProps.columns.find((c) => c.field === 'isEEACore');

    const sampleRow = {
      dataflowName: 'Dataflow A',
      dataflowURL: 'https://example.org/df',
      obligationName: 'Obligation B',
      obligationURL: '',
      legalInstrumentName: 'Instrument C',
      legalInstrumentURL: 'https://example.org/li',
      reporterEmails: ['a@example.org', 'b@example.org'],
      deadlineDate: new Date('2024-01-10'),
      firstReleaseDate: new Date('2024-01-01'),
      lastReleaseDate: new Date('2024-02-01'),
      status: 'Open',
      deliveryStatus: 'Final feedback',
      isEEACore: true,
    };

    const titleHeaderHtml = renderToStaticMarkup(<>{titleColumn.renderHeader()}</>);
    expect(titleHeaderHtml).toContain('Dataflow');
    expect(titleHeaderHtml).toContain('Obligation');
    expect(titleHeaderHtml).toContain('Legal instrument');

    const titleCellHtml = renderToStaticMarkup(<>{titleColumn.renderCell({ row: sampleRow })}</>);
    expect(titleCellHtml).toContain('Dataflow A');
    expect(titleCellHtml).toContain('Obligation B');
    expect(titleCellHtml).toContain('Instrument C');

    const reportersHtml = renderToStaticMarkup(
      <>{reportersColumn.renderCell({ row: sampleRow })}</>,
    );
    expect(reportersHtml).toContain('mailto:a@example.org');
    expect(reportersHtml).toContain('mailto:b@example.org');

    const deadlineHtml = renderToStaticMarkup(<>{deadlineColumn.renderCell({ row: sampleRow })}</>);
    expect(deadlineHtml).toContain('10-Jan-2024');

    const releaseHtml = renderToStaticMarkup(<>{releaseColumn.renderCell({ row: sampleRow })}</>);
    expect(releaseHtml).toContain('(first)');
    expect(releaseHtml).toContain('(latest)');

    const statusHtml = renderToStaticMarkup(<>{statusColumn.renderCell({ row: sampleRow })}</>);
    expect(statusHtml).toContain('status-open');
    expect(statusHtml).toContain('Open');

    const closedStatusHtml = renderToStaticMarkup(
      <>{statusColumn.renderCell({ row: { ...sampleRow, status: 'Closed' } })}</>,
    );
    expect(closedStatusHtml).toContain('status-closed');
    expect(closedStatusHtml).toContain('Closed');

    const deliveryHtml = renderToStaticMarkup(<>{deliveryColumn.renderCell({ row: sampleRow })}</>);
    expect(deliveryHtml).toContain('delivery-status-finalfeedback');

    const coreHtml = renderToStaticMarkup(<>{coreColumn.renderCell({ row: sampleRow })}</>);
    expect(coreHtml).toContain('svg');
  });
});
