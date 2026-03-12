import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProgressGauge } from './ProgressGauge';

describe('ProgressGauge', () => {
  test('renders label and ratio values', () => {
    const html = renderToStaticMarkup(
      <ProgressGauge
        totalCount={20}
        responseCount={8}
        label="Consultations"
        infoText="Info text"
      />,
    );

    expect(html).toContain('Consultations');
    expect(html).toContain('/20');
    expect(html).toContain('8');
  });

  test('renders details link text when url exists', () => {
    const html = renderToStaticMarkup(
      <ProgressGauge
        totalCount={2}
        responseCount={1}
        label="Events"
        infoText="Info"
        url="https://example.org"
      />,
    );

    expect(html).toContain('Events');
  });
});
