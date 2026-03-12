let mockRunEffect = true;

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useState: jest.fn(actual.useState),
    useEffect: jest.fn((fn) => {
      if (mockRunEffect) {
        mockRunEffect = false;
        fn();
      }
    }),
  };
});

import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { GroupView } from './GroupView';
import { getADUserInfos } from '../../data/sharepointProvider';

const gridProps = [];

jest.mock('../../data/sharepointProvider', () => ({
  getADUserInfos: jest.fn(),
}));

jest.mock('./UserCard', () => ({
  UserCard: ({ userInfo }) => <div>{userInfo.UserName}</div>,
}));

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: (props) => {
    gridProps.push(props);
    return <div>grid-rows-{props.rows?.length || 0}</div>;
  },
}));

describe('GroupView', () => {
  const baseGroup = {
    GroupName: 'Air',
    OfficialGroupName: 'Air Group',
    ETCManagerIds: [202],
    EEAGroupLeadsIds: [101],
    OtherMembership: true,
    Users: [
      { id: 1, Title: 'Member 1', Organisation: 'Org', Email: 'm1@example.org', PCP: ['Air'] },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRunEffect = true;
    gridProps.length = 0;
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);

    getADUserInfos.mockResolvedValue([
      {
        id: 'a',
        lookupId: 101,
        displayName: 'Lead User',
        mail: 'lead@example.org',
        companyName: 'EEA',
        businessPhones: ['+1'],
        jobTitle: 'Lead',
        department: 'Dept',
      },
      {
        id: 'b',
        lookupId: 202,
        displayName: 'ETC User',
        mail: 'etc@example.org',
        companyName: 'EEA',
        businessPhones: [],
        jobTitle: 'Manager',
        department: 'Dept',
        base64Photo: 'abc',
      },
    ]);
  });

  test('renders group title and users grid', () => {
    const html = renderToStaticMarkup(
      <GroupView configuration={{ DashboardLeadIconTooltip: 'Lead' }} group={{ ...baseGroup }} />,
    );

    expect(html).toContain('Air Group');
    expect(html).toContain('grid-rows-1');
    expect(gridProps[0].id).toBe('Air');
  });

  test('renders no content for missing group', () => {
    const html = renderToStaticMarkup(
      <GroupView configuration={{ DashboardLeadIconTooltip: 'Lead' }} group={null} />,
    );

    expect(html).toContain('grid-container');
    expect(html).not.toContain('grid-rows-');
  });

  test('renders lead and etc manager sections from state', () => {
    let call = 0;
    React.useState.mockImplementation((initialValue) => {
      call += 1;
      if (call === 1) return [false, jest.fn()];
      if (call === 2) return [[{ id: 'l1', UserName: 'Lead User' }], jest.fn()];
      if (call === 3) return [[{ id: 'e1', UserName: 'ETC User' }], jest.fn()];
      if (call === 4) return [true, jest.fn()];
      return [initialValue, jest.fn()];
    });

    const html = renderToStaticMarkup(
      <GroupView configuration={{ DashboardLeadIconTooltip: 'Lead' }} group={{ ...baseGroup }} />,
    );

    expect(html).toContain('EEA ETC Lead:');
    expect(html).toContain('ETC Manager:');
    expect(html).toContain('Lead User');
    expect(html).toContain('ETC User');
  });

  test('loads AD user infos for leads and etc managers', async () => {
    renderToStaticMarkup(
      <GroupView configuration={{ DashboardLeadIconTooltip: 'Lead' }} group={{ ...baseGroup }} />,
    );

    await Promise.resolve();
    await Promise.resolve();

    expect(getADUserInfos).toHaveBeenCalledWith([101]);
  });

  test('skips AD call when no lead ids exist', async () => {
    renderToStaticMarkup(
      <GroupView
        configuration={{ DashboardLeadIconTooltip: 'Lead' }}
        group={{ ...baseGroup, EEAGroupLeadsIds: [], ETCManagerIds: [], OtherMembership: false }}
      />,
    );

    await Promise.resolve();

    expect(getADUserInfos).not.toHaveBeenCalled();
  });

  test('renders title column with PCP icon from grid renderCell', () => {
    renderToStaticMarkup(
      <GroupView
        configuration={{ DashboardLeadIconTooltip: 'Lead tooltip' }}
        group={{ ...baseGroup }}
      />,
    );

    const titleColumn = gridProps[0].columns.find((c) => c.field === 'Title');
    const cellHtml = renderToStaticMarkup(
      titleColumn.renderCell({ row: { Title: 'Member 1', PCP: ['Air'] } }),
    );

    expect(cellHtml).toContain('Member 1');
    expect(cellHtml).toContain('svg');
  });
});
