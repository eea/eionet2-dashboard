import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UnderConstruction } from './UnderConstruction';

describe('UnderConstruction', () => {
  test('renders the under construction message and icon container', () => {
    const html = renderToStaticMarkup(<UnderConstruction />);

    expect(html).toContain('Page under construction');
    expect(html).toContain('svg');
    expect(html).toContain('data-testid="ConstructionIcon"');
  });
});
