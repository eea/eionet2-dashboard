import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardColumns } from './CardColumns';
import { useMediaQuery } from 'react-responsive';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(() => false),
}));
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ columns, rows }) => (
    <div>
      {columns.map((column) => (
        <div key={column.field}>
          {'[' + column.headerName + ']'}
          {rows.map((row) => (
            <div key={row.id}>{column.renderCell({ row })}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('CardColumns', () => {
  test('renders a grid per column, with names only when there are no dates', () => {
    const html = renderToStaticMarkup(
      <CardColumns
        columns={[
          { title: 'With nominations', items: [{ id: 'TG-Air', Name: 'TG-Air' }] },
          { title: 'Without nominations', items: [] },
        ]}
      />,
    );

    expect(html).toContain('[With nominations]');
    expect(html).toContain('[Without nominations]');
    expect(html).toContain('TG-Air');
    expect(html).not.toContain('[Date]');
  });

  test('renders the date column and links the name when items have dates', () => {
    const html = renderToStaticMarkup(
      <CardColumns
        dateFormat="dd-MMM-yyyy"
        columns={[
          {
            title: 'Events participated',
            items: [
              {
                id: 1,
                Name: 'Eionet workshop',
                Date: new Date(2025, 2, 12),
                Link: 'https://folder',
              },
              { id: 2, Name: 'NDFC meeting' },
            ],
          },
        ]}
      />,
    );

    expect(html).toContain('[Events participated]');
    expect(html).toContain('[Date]');
    expect(html).toContain('12-Mar-2025');
    expect(html).toContain('Eionet workshop');
    expect(html).toContain('NDFC meeting');
  });

  test('stacks the columns in collapsible panels on mobile', () => {
    useMediaQuery.mockReturnValueOnce(true);

    const html = renderToStaticMarkup(
      <CardColumns
        columns={[
          { title: 'With nominations', items: [{ id: 'TG-Air', Name: 'TG-Air' }] },
          { title: 'Without nominations', items: [] },
        ]}
      />,
    );

    expect(html).toContain('card-columns-mobile');
    expect(html).toContain('With nominations (1)');
    expect(html).toContain('Without nominations (0)');
  });
});
