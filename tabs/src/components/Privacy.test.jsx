import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Privacy from './Privacy';

describe('Privacy', () => {
  test('renders privacy statement title', () => {
    const html = renderToStaticMarkup(<Privacy />);

    expect(html).toContain('<h1>Privacy Statement</h1>');
  });
});
