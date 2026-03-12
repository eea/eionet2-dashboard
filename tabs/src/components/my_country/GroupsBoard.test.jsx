import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupsBoard } from './GroupsBoard';

jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));
jest.mock('./GroupView', () => ({
  GroupView: ({ group }) => <div>group-view-{group?.GroupName}</div>,
}));
jest.mock('../CustomDrawer', () => ({
  __esModule: true,
  default: ({ drawerOptions }) => <div>{drawerOptions}</div>,
}));

describe('GroupsBoard', () => {
  test('renders group list and selected group view', () => {
    const html = renderToStaticMarkup(
      <GroupsBoard
        configuration={{}}
        users={[{ AllMemberships: ['Air'] }]}
        mappings={[{ Membership: 'Air', OfficialGroupName: 'Air Group' }]}
      />,
    );

    expect(html).toContain('Air');
    expect(html).toContain('group-view-Air');
  });
});
