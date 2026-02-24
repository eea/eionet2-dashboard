import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupView } from './GroupView';

jest.mock('../../data/sharepointProvider', () => ({
  getADUserInfos: jest.fn(),
}));
jest.mock('./UserCard', () => ({
  UserCard: ({ userInfo }) => <div>{userInfo.UserName}</div>,
}));
jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
}));

describe('GroupView', () => {
  test('renders group title and users grid', () => {
    const html = renderToStaticMarkup(
      <GroupView
        configuration={{ DashboardLeadIconTooltip: 'Lead' }}
        group={{
          GroupName: 'Air',
          OfficialGroupName: 'Air Group',
          ETCManagerIds: [],
          EEAGroupLeadsIds: [],
          OtherMembership: false,
          Users: [{ id: 1, Title: 'Member 1' }],
        }}
      />,
    );

    expect(html).toContain('Air Group');
    expect(html).toContain('grid-rows-1');
  });
});
