import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TabPanel from './TabPanel';

describe('TabPanel', () => {
  test('renders content when selected tab index matches value', () => {
    const html = renderToStaticMarkup(
      <TabPanel value={1} index={1}>
        Visible content
      </TabPanel>,
    );

    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('id="simple-tabpanel-1"');
    expect(html).toContain('aria-labelledby="simple-tab-1"');
    expect(html).not.toContain('hidden=""');
    expect(html).toContain('Visible content');
  });

  test('hides and does not render content when index does not match value', () => {
    const html = renderToStaticMarkup(
      <TabPanel value={0} index={1}>
        Hidden content
      </TabPanel>,
    );

    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('hidden=""');
    expect(html).not.toContain('Hidden content');
  });
});
