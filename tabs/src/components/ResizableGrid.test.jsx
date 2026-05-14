import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DataGrid } from '@mui/x-data-grid';
import ResizableGrid from './ResizableGrid';
import Constants from '../data/constants.json';

const mockResizeIcon = jest.fn(() => <div data-testid="resize-icon">resize-icon</div>);

jest.mock('@mui/x-data-grid', () => {
  const React = require('react');
  return {
    DataGrid: jest.fn(() => <div>mock-data-grid</div>),
  };
});

jest.mock('./CustomColumnResizeIcon', () => ({
  __esModule: true,
  default: (props) => mockResizeIcon(props),
}));

describe('ResizableGrid', () => {
  beforeEach(() => {
    DataGrid.mockClear();
    mockResizeIcon.mockClear();
  });

  test('renders data grid with provided columns and rows and wires resize component', () => {
    const columns = [{ field: 'title', headerName: 'Title' }];

    const html = renderToStaticMarkup(
      <ResizableGrid id="grid1" rows={[{ id: 1, title: 'A' }]} columns={columns} />,
    );

    expect(html).toContain('mock-data-grid');
    expect(DataGrid).toHaveBeenCalled();
    const props = DataGrid.mock.calls[0][0];
    expect(props.columns).toEqual(columns);
    expect(props.getRowHeight()).toBe(Constants.GridRowHeight);
    expect(props.slots).toMatchObject({
      columnResizeIcon: expect.any(Function),
    });

    renderToStaticMarkup(<props.slots.columnResizeIcon />);
    expect(mockResizeIcon).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'grid1', onWidthChanged: expect.any(Function) }),
    );
  });

  test('forwards extra props to DataGrid', () => {
    renderToStaticMarkup(
      <ResizableGrid
        id="grid1"
        autoHeight
        rows={[{ id: 1, title: 'A' }]}
        columns={[{ field: 'title', headerName: 'Title' }]}
      />,
    );

    const props = DataGrid.mock.calls[0][0];
    expect(props.id).toBe('grid1');
    expect(props.autoHeight).toBe(true);
    expect(props.rows).toEqual([{ id: 1, title: 'A' }]);
  });
});
