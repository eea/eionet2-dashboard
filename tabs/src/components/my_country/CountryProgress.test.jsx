import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { CountryProgress } from './CountryProgress';

jest.mock('./YearlyProgress', () => ({
  YearlyProgress: ({ yearData }) => <div>yearly-{yearData.year}</div>,
}));

describe('CountryProgress', () => {
  test('renders yearly overview tabs', () => {
    const html = renderToStaticMarkup(
      <CountryProgress
        configuration={{}}
        lastYears={[
          { year: 2024 },
          { year: 2023 },
        ]}
      />,
    );

    expect(html).toContain('Yearly overview:');
    expect(html).toContain('2024');
    expect(html).toContain('2023');
    expect(html).toContain('yearly-2024');
  });
});
