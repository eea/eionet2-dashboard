jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useState: jest.fn(actual.useState),
    useEffect: jest.fn((fn) => fn()),
    useCallback: jest.fn((fn) => fn),
  };
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MyCountry } from './MyCountry';
import {
  getMappingsList,
  getInvitedUsers,
  getOrganisationList,
  getAvailableGroups,
  getCountryCodeMappingsList,
} from '../../data/sharepointProvider';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

jest.mock('./my_country.scss', () => ({}));

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const ListItemButton = ({ children, onClick }) => {
    onClick && onClick();
    return <div>{children}</div>;
  };

  return {
    Backdrop: passthrough(),
    Box: passthrough(),
    CircularProgress: passthrough('span'),
    Typography: passthrough('span'),
    ListItem: passthrough(),
    ListItemText: ({ primary }) => <div>{primary}</div>,
    ListItemButton,
    ListItemIcon: passthrough(),
  };
});

jest.mock('@mui/icons-material/Preview', () => () => <span>preview-icon</span>);
jest.mock('@mui/icons-material/ManageAccounts', () => () => <span>manage-accounts-icon</span>);
jest.mock('@mui/icons-material/Group', () => () => <span>group-icon</span>);
jest.mock('@mui/icons-material/Groups', () => () => <span>groups-icon</span>);
jest.mock('@mui/icons-material/GroupWork', () => () => <span>group-work-icon</span>);
jest.mock('@mui/icons-material/Summarize', () => () => <span>summarize-icon</span>);

jest.mock('../../data/sharepointProvider', () => ({
  getMappingsList: jest.fn(),
  getInvitedUsers: jest.fn(),
  getOrganisationList: jest.fn(),
  getAvailableGroups: jest.fn(),
  getCountryCodeMappingsList: jest.fn(),
}));

jest.mock('@microsoft/applicationinsights-react-js', () => ({
  useAppInsightsContext: jest.fn(),
}));

jest.mock('./AtAGlance', () => ({
  AtAGlance: () => <div>at-a-glance</div>,
}));
jest.mock('./ManagementBoard', () => ({
  ManagementBoard: () => <div>management-board</div>,
}));
jest.mock('./GroupsBoard', () => ({
  GroupsBoard: () => <div>groups-board</div>,
}));
jest.mock('./CountryMembers', () => ({
  CountryMembers: () => <div>country-members</div>,
}));
jest.mock('./DataReporters', () => ({
  DataReporters: () => <div>data-reporters</div>,
}));
jest.mock('../CustomDrawer', () => ({
  __esModule: true,
  default: ({ drawerOptions }) => <div>{drawerOptions}</div>,
}));

function mockStateSequence(values) {
  let index = 0;
  React.useState.mockImplementation((initialValue) => {
    if (index < values.length) {
      const current = values[index];
      index += 1;
      return [current, jest.fn()];
    }
    return [initialValue, jest.fn()];
  });
}

function buildStates(tabValue = 0) {
  return [
    tabValue,
    [{ id: 1 }],
    [{ OtherMembership: false }, { OtherMembership: true }],
    false,
    [{ id: 'org' }],
    { CountryCode: 'RO', Name: 'Romania' },
    ['Air', 'Climate'],
  ];
}

describe('MyCountry', () => {
  const trackEvent = jest.fn();
  const closeDrawer = jest.fn();

  const baseProps = {
    userInfo: { isNFP: true },
    selectedCountry: 'RO',
    configuration: {},
    drawerOpen: true,
    closeDrawer,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    React.useEffect.mockImplementation((fn) => fn());
    React.useCallback.mockImplementation((fn) => fn);
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);

    useAppInsightsContext.mockReturnValue({ trackEvent });

    getInvitedUsers.mockResolvedValue([{ id: 1 }]);
    getOrganisationList.mockResolvedValue([{ id: 'org' }]);
    getAvailableGroups.mockResolvedValue(['wg-test', 'Air group']);
    getCountryCodeMappingsList.mockResolvedValue([{ CountryCode: 'RO' }]);
    getMappingsList.mockResolvedValue([{ OtherMembership: false }, { OtherMembership: true }]);
  });

  test('renders drawer menu and at-a-glance tab', () => {
    mockStateSequence(buildStates(0));

    const html = renderToStaticMarkup(<MyCountry {...baseProps} />);

    expect(html).toContain('At a glance');
    expect(html).toContain('NFPs');
    expect(html).toContain('Eionet groups');
    expect(html).toContain('ETCs');
    expect(html).toContain('Country desk officers');
    expect(html).toContain('Reporting');
    expect(html).toContain('at-a-glance');
    expect(closeDrawer).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalled();
  });

  test('renders management board tab', () => {
    mockStateSequence(buildStates(1));

    const html = renderToStaticMarkup(<MyCountry {...baseProps} />);

    expect(html).toContain('management-board');
  });

  test('renders groups board tabs', () => {
    mockStateSequence(buildStates(2));
    const htmlGroups = renderToStaticMarkup(<MyCountry {...baseProps} />);
    expect(htmlGroups).toContain('groups-board');

    mockStateSequence(buildStates(3));
    const htmlEtc = renderToStaticMarkup(<MyCountry {...baseProps} />);
    expect(htmlEtc).toContain('groups-board');
  });

  test('renders country members and data reporters tabs', () => {
    mockStateSequence(buildStates(4));
    const htmlMembers = renderToStaticMarkup(<MyCountry {...baseProps} />);
    expect(htmlMembers).toContain('country-members');

    mockStateSequence(buildStates(5));
    const htmlReporters = renderToStaticMarkup(<MyCountry {...baseProps} />);
    expect(htmlReporters).toContain('data-reporters');
  });

  test('hides country-specific tabs when selectedCountry is missing', () => {
    mockStateSequence(buildStates(0));

    const html = renderToStaticMarkup(
      <MyCountry
        {...baseProps}
        selectedCountry={''}
      />,
    );

    expect(html).not.toContain('Country desk officers');
    expect(html).not.toContain('Reporting');
  });

  test('loads data from providers', async () => {
    mockStateSequence(buildStates(0));

    renderToStaticMarkup(<MyCountry {...baseProps} />);
    await Promise.resolve();
    await Promise.resolve();

    expect(getInvitedUsers).toHaveBeenCalledWith('RO');
    expect(getOrganisationList).toHaveBeenCalledWith('RO');
    expect(getAvailableGroups).toHaveBeenCalled();
    expect(getCountryCodeMappingsList).toHaveBeenCalled();
    expect(getMappingsList).toHaveBeenCalled();
  });

  test('handles invited users loading errors', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    getInvitedUsers.mockRejectedValue(new Error('failed users'));
    mockStateSequence(buildStates(0));

    renderToStaticMarkup(<MyCountry {...baseProps} />);
    await Promise.resolve();
    await Promise.resolve();

    expect(logSpy).toHaveBeenCalledWith('failed users');
    logSpy.mockRestore();
  });
});
