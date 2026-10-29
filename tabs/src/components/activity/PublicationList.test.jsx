import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicatonList } from './PublicationList';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows, columns }) => {
    const typeColumn = columns.find((c) => c.field === 'ItemType');
    return (
      <div>
        grid-rows-{rows?.length || 0}
        {rows?.map((row) => (
          <div key={row.id}>{typeColumn.renderCell({ row })}</div>
        ))}
      </div>
    );
  },
}));

jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));

describe('PublicationList', () => {
  test('renders intro text and future publications grid for tab 0', () => {
    const html = renderToStaticMarkup(
      <PublicatonList
        userInfo={{}}
        configuration={{
          DateFormatDashboard: 'dd-MMM-yyyy',
          PublicationsIntroText: 'Intro text',
        }}
        futurePublications={[{ id: 1, Title: 'Future Publication' }]}
        pastPublications={[]}
        tabsValue={0}
      />,
    );

    expect(html).toContain('Intro text');
    expect(html).toContain('grid-rows-1');
  });

  test('renders past publications grid for tab 1', () => {
    const html = renderToStaticMarkup(
      <PublicatonList
        userInfo={{}}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        futurePublications={[]}
        pastPublications={[{ id: 1, Title: 'Past Publication' }]}
        tabsValue={1}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });

  test('renders item types as chips', () => {
    const html = renderToStaticMarkup(
      <PublicatonList
        userInfo={{}}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        futurePublications={[{ id: 1, Title: 'Typed', ItemType: ['Report', 'Article'] }]}
        pastPublications={[]}
        tabsValue={0}
      />,
    );

    expect(html).toContain('Report');
    expect(html).toContain('Article');
    expect(html).toContain('chipContainer');
  });
});
