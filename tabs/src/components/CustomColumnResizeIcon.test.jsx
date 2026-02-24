import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomColumnResizeIcon from './CustomColumnResizeIcon';

describe('CustomColumnResizeIcon', () => {
  test('renders draggable resize handle', () => {
    const html = renderToStaticMarkup(<CustomColumnResizeIcon />);

    expect(html).toContain('resizable');
    expect(html).toContain('draggable');
  });
});
