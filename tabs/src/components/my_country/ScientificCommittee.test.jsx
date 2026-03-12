import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScientificCommittee } from './ScientificCommittee';

describe('ScientificCommittee', () => {
  test('renders under construction message', () => {
    const html = renderToStaticMarkup(<ScientificCommittee />);

    expect(html).toContain('Page under construction');
  });
});
