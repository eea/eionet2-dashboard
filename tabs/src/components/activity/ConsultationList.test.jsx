import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConsultationList } from './ConsultationList';

let mockGridProps;

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: (props) => {
    mockGridProps = props;
    return <div>grid-rows-{props.rows?.length || 0}</div>;
  },
}));

jest.mock('./GroupsTags', () => ({
  GroupsTags: ({ groups }) => <div>groups-{groups?.length || 0}</div>,
}));

describe('ConsultationList', () => {
  beforeEach(() => {
    mockGridProps = null;
  });

  test('renders future consultations grid for tab 0', () => {
    const html = renderToStaticMarkup(
      <ConsultationList
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        openConsultations={[]}
        reviewConsultations={[]}
        finalisedConsultations={[]}
        futureConsultations={[{ id: 1, Title: 'Future' }]}
        type="Consultations"
        country="RO"
        tabsValue={0}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });

  test('renders open consultations grid for tab 1 and colors urgent values', () => {
    const html = renderToStaticMarkup(
      <ConsultationList
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        openConsultations={[{ id: 1, Title: 'Open' }]}
        reviewConsultations={[]}
        finalisedConsultations={[]}
        futureConsultations={[]}
        type="Consultations"
        country=""
        tabsValue={1}
      />,
    );

    expect(html).toContain('grid-rows-1');
    const daysLeftColumn = mockGridProps.columns.find((column) => column.field === 'DaysLeft');
    expect(daysLeftColumn.cellClassName({ value: 2 })).toBe('red-cell-text');
    expect(daysLeftColumn.cellClassName({ value: 4 })).toBeUndefined();
  });

  test('renders review grid for tab 2', () => {
    const html = renderToStaticMarkup(
      <ConsultationList
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        openConsultations={[]}
        reviewConsultations={[{ id: 3, Title: 'Review', Startdate: new Date('2026-01-01') }]}
        finalisedConsultations={[]}
        futureConsultations={[]}
        type="Consultations"
        country="RO"
        tabsValue={2}
      />,
    );

    expect(html).toContain('grid-rows-1');
    expect(mockGridProps.columns.some((column) => column.field === 'DaysFinalised')).toBe(true);
  });

  test('renders finalised grid for tab 3 and result/country cells', () => {
    renderToStaticMarkup(
      <ConsultationList
        configuration={{
          DateFormatDashboard: 'dd-MMM-yyyy',
          ConsultationResultsTooltip: 'results',
          CountryRespondedTooltip: 'responded',
        }}
        openConsultations={[]}
        reviewConsultations={[]}
        finalisedConsultations={[{ id: 4, Title: 'Final', Deadline: new Date('2026-02-01') }]}
        futureConsultations={[]}
        type="Consultations"
        country=""
        tabsValue={3}
      />,
    );

    const resultsColumn = mockGridProps.columns.find((column) => column.field === 'Results');
    const respondantsColumn = mockGridProps.columns.find(
      (column) => column.field === 'HasUserCountryResponded',
    );

    const resultHtml = renderToStaticMarkup(
      resultsColumn.renderCell({ row: { LinkToResults: 'https://example.org/results' } }),
    );
    const respondedHtml = renderToStaticMarkup(
      respondantsColumn.renderCell({
        row: { HasUserCountryResponded: false, Respondants: [{}, {}, {}] },
      }),
    );

    expect(resultHtml).toContain('button');
    expect(respondedHtml).toContain('3');
  });
});
