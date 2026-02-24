import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupsTags } from './GroupsTags';

describe('GroupsTags', () => {
  test('renders chips and dialog class when isDialog is true', () => {
    const html = renderToStaticMarkup(
      <GroupsTags groups={['A', 'B']} handleClick={jest.fn()} isDialog={true} />,
    );

    expect(html).toContain('groups-tags-dialog');
    expect(html).toContain('A');
    expect(html).toContain('B');
  });

  test('renders without dialog class when isDialog is false', () => {
    const html = renderToStaticMarkup(
      <GroupsTags groups={['A']} handleClick={jest.fn()} isDialog={false} />,
    );

    expect(html).not.toContain('groups-tags-dialog');
  });
});
