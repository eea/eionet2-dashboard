import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Reporting } from './Reporting';

describe('Reporting', () => {
  test('renders under construction message', () => {
    const html = renderToStaticMarkup(<Reporting />);

    expect(html).toContain('Page under construction');
  });
});
