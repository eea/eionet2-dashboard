import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PublicatonList } from './PublicationList';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
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
});
