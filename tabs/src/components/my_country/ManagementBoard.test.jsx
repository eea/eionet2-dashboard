import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ManagementBoard } from './ManagementBoard';

const gridProps = [];

jest.mock('@mui/material', () => ({
  Box: ({ children, className }) => <div className={className}>{children}</div>,
  Chip: ({ label }) => <span>{label}</span>,
  Tooltip: ({ title, children }) => (
    <div>
      <span>{title}</span>
      {children}
    </div>
  ),
}));

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: (props) => {
    gridProps.push(props);
    return <div>grid-rows-{props.rows?.length || 0}</div>;
  },
}));

describe('ManagementBoard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gridProps.length = 0;
  });

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
            OtherMemberships: ['Other'],
          },
          {
            id: 2,
            Organisation: 'Org2',
            Title: 'Ignored',
            Email: 'i@example.org',
            Membership: ['NonBoard'],
            OtherMemberships: [],
          },
        ]}
      />,
    );

    expect(html).toContain('grid-rows-1');
    expect(gridProps[0].rows[0].BoardMembership).toBe('Board');
    expect(gridProps[0].rows[0].Name).toBe('Member');
  });

  test('includes NFP users even without board mapping membership', () => {
    renderToStaticMarkup(
      <ManagementBoard
        mappings={[{ ManagementBoard: true, Membership: 'Board' }]}
        users={[
          {
            id: 3,
            Organisation: 'Org3',
            Title: 'NFP User',
            Email: 'nfp@example.org',
            NFP: 'NFP role',
            Membership: ['NonBoard'],
            OtherMemberships: [],
          },
        ]}
      />,
    );

    expect(gridProps[0].rows).toHaveLength(1);
    expect(gridProps[0].rows[0].BoardMembership).toBe('NFP role');
  });

  test('renders other memberships cell chips excluding board membership', () => {
    renderToStaticMarkup(
      <ManagementBoard
        mappings={[{ ManagementBoard: true, Membership: 'Board' }]}
        users={[
          {
            id: 4,
            Organisation: 'Org4',
            Title: 'Board Member',
            Email: 'board@example.org',
            NFP: 'NFP role',
            Membership: ['Board', 'Group A'],
            OtherMemberships: ['Group B'],
          },
        ]}
      />,
    );

    const otherMembershipsColumn = gridProps[0].columns.find((c) => c.field === 'OtherMemberships');
    const cellHtml = renderToStaticMarkup(
      otherMembershipsColumn.renderCell({
        row: {
          BoardMembership: 'Board',
          Membership: ['Board', 'Group A'],
          OtherMemberships: ['Group B'],
          NFP: 'NFP role',
        },
      }),
    );

    expect(cellHtml).toContain('Group A');
    expect(cellHtml).toContain('Group B');
    expect(cellHtml).toContain('NFP role');
    expect(cellHtml).not.toContain('>Board<');
  });
});
