import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { ManagementBoard } from './ManagementBoard';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
}));

describe('ManagementBoard', () => {
  test('renders filtered board users in grid', () => {
    const html = renderToStaticMarkup(
      <ManagementBoard
        mappings={[{ ManagementBoard: true, Membership: 'Board' }]}
        users={[
          {
            id: 1,
            Organisation: 'Org',
            Title: 'Member',
            Email: 'm@example.org',
            Membership: ['Board'],
            OtherMemberships: [],
          },
        ]}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });
});
