import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ResizableGrid from './ResizableGrid';

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: () => <div>mock-data-grid</div>,
}));

jest.mock('./CustomColumnResizeIcon', () => ({
  __esModule: true,
  default: () => <div>resize-icon</div>,
}));

describe('ResizableGrid', () => {
  test('renders data grid with provided columns and rows', () => {
    const html = renderToStaticMarkup(
      <ResizableGrid
        id="grid1"
        rows={[{ id: 1, title: 'A' }]}
        columns={[{ field: 'title', headerName: 'Title' }]}
      />,
    );

    expect(html).toContain('mock-data-grid');
  });
});
