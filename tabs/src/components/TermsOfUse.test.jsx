import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TermsOfUse from './TermsOfUse';

describe('TermsOfUse', () => {
  test('renders terms of use title', () => {
    const html = renderToStaticMarkup(<TermsOfUse />);

    expect(html).toContain('<h1>Terms of Use</h1>');
  });
});
