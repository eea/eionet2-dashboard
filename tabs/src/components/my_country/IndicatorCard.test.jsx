import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { IndicatorCard } from './IndicatorCard';

describe('IndicatorCard', () => {
  test('renders label and value', () => {
    const html = renderToStaticMarkup(
      <IndicatorCard labelText="Users" valueText="42" infoText="Details" />,
    );

    expect(html).toContain('Users');
    expect(html).toContain('42');
  });

  test('renders card with dialog content', () => {
    const html = renderToStaticMarkup(
      <IndicatorCard
        labelText="Groups"
        valueText="2/3"
        dialogTitle="Eionet and thematic groups"
        dialogContent={<span>columns</span>}
      />,
    );

    expect(html).toContain('Groups');
    expect(html).toContain('2/3');
  });

  test('renders details link when url exists', () => {
    const html = renderToStaticMarkup(
      <IndicatorCard
        labelText="Users"
        valueText="42"
        infoText="Details"
        url="https://example.org"
      />,
    );

    expect(html).toContain('Details');
  });
});
