import React from 'react';
jest.mock('./my_country.scss', () => ({}));
import { renderToStaticMarkup } from 'react-dom/server';
import { CountryMembers } from './CountryMembers';

jest.mock('../../data/sharepointProvider', () => ({
  getADUserInfos: jest.fn(),
}));
jest.mock('./UserCard', () => ({
  UserCard: ({ userInfo }) => <div>{userInfo.UserName}</div>,
}));

describe('CountryMembers', () => {
  test('renders wrapper for selected country', () => {
    const html = renderToStaticMarkup(
      <CountryMembers countryInfo={{ CountryName: 'Romania', CDO: [], TeamMember: [] }} />,
    );

    expect(html).toContain('grid-container');
  });
});
