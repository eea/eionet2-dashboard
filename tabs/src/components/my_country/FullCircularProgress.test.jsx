import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FullCircularProgress } from './FullCircularProgress';

describe('FullCircularProgress', () => {
  test('renders determinate progress circles with computed value', () => {
    const html = renderToStaticMarkup(<FullCircularProgress totalCount={10} responseCount={5} />);

    expect(html).toContain('MuiCircularProgress-root');
    expect(html).toContain('50');
  });

  test('falls back to 0 value when total count is zero', () => {
    const html = renderToStaticMarkup(<FullCircularProgress totalCount={0} responseCount={5} />);

    expect(html).toContain('MuiCircularProgress-root');
    expect(html).toContain('0');
  });
});
