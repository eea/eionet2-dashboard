import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CustomDrawer from './CustomDrawer';

describe('CustomDrawer', () => {
  test('renders permanent drawer with provided content', () => {
    const html = renderToStaticMarkup(
      <CustomDrawer drawerOptions={<div>Drawer options content</div>} />,
    );

    expect(html).toContain(' drawer ');
    expect(html).toContain('Drawer options content');
  });
});
