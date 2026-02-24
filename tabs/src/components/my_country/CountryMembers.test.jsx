jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useState: jest.fn(actual.useState),
    useEffect: jest.fn((fn) => fn()),
  };
});

import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { CountryMembers } from './CountryMembers';
import { getADUserInfos } from '../../data/sharepointProvider';

jest.mock('../../data/sharepointProvider', () => ({
  getADUserInfos: jest.fn(),
}));

jest.mock('./UserCard', () => ({
  UserCard: ({ userInfo }) => <div>{userInfo.UserName}</div>,
}));

function mockStateSequence(values) {
  let index = 0;
  React.useState.mockImplementation((initialValue) => {
    if (index < values.length) {
      const value = values[index];
      index += 1;
      return [value, jest.fn()];
    }
    return [initialValue, jest.fn()];
  });
}

describe('CountryMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);
    React.useEffect.mockImplementation((fn) => fn());
    getADUserInfos.mockResolvedValue([]);
  });

  test('renders wrapper and no sections when countryInfo is missing', () => {
    const html = renderToStaticMarkup(<CountryMembers countryInfo={null} />);

    expect(html).toContain('grid-container');
    expect(html).not.toContain('Country desk officer for');
    expect(html).not.toContain('Country desk officer team members');
  });

  test('renders leads and members sections when state contains users', () => {
    mockStateSequence([
      false,
      [{ id: 'l1', UserName: 'Lead User' }],
      [{ id: 'm1', UserName: 'Member User' }],
    ]);

    const html = renderToStaticMarkup(
      <CountryMembers countryInfo={{ CountryName: 'Romania', CDO: [], TeamMember: [] }} />,
    );

    expect(html).toContain('Country desk officer for Romania');
    expect(html).toContain('Country desk officer team members');
    expect(html).toContain('Lead User');
    expect(html).toContain('Member User');
  });

  test('loads AD users for CDO and team members', async () => {
    const countryInfo = {
      CountryName: 'Romania',
      CDO: [{ LookupId: 101 }],
      TeamMember: [{ LookupId: 202 }],
    };

    getADUserInfos.mockResolvedValue([
      {
        id: 'a',
        lookupId: 101,
        displayName: 'CDO 1',
        mail: 'cdo@example.org',
        companyName: 'EEA',
        businessPhones: ['+40'],
        jobTitle: 'Officer',
        department: 'Dept',
      },
      {
        id: 'b',
        lookupId: 202,
        displayName: 'Team 1',
        mail: 'team@example.org',
        companyName: 'EEA',
        businessPhones: [],
        jobTitle: 'Member',
        department: 'Dept',
        base64Photo: 'abc123',
      },
      null,
    ]);

    renderToStaticMarkup(<CountryMembers countryInfo={countryInfo} />);
    await Promise.resolve();
    await Promise.resolve();

    expect(getADUserInfos).toHaveBeenCalledWith([101, 202]);
  });

  test('does not load users when there are no member ids', async () => {
    renderToStaticMarkup(
      <CountryMembers countryInfo={{ CountryName: 'Romania', CDO: [], TeamMember: [] }} />,
    );
    await Promise.resolve();

    expect(getADUserInfos).not.toHaveBeenCalled();
  });
});
