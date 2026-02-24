import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConsultationList } from './ConsultationList';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
}));

jest.mock('./GroupsTags', () => ({
  GroupsTags: ({ groups }) => <div>groups-{groups?.length || 0}</div>,
}));

describe('ConsultationList', () => {
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

  test('renders open consultations grid for tab 1', () => {
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
  });
});
