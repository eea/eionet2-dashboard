import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomColumnResizeIcon from './CustomColumnResizeIcon';

jest.mock('@mui/x-data-grid', () => ({
  GridSeparatorIcon: () => <span>grid-separator</span>,
}));

describe('CustomColumnResizeIcon', () => {
  test('renders the draggable resize icon handle', () => {
    const html = renderToStaticMarkup(<CustomColumnResizeIcon />);

    expect(html).toContain('class="resizable"');
    expect(html).toContain('draggable="true"');
    expect(html).toContain('grid-separator');
  });
});
