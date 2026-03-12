import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useMediaQuery } from 'react-responsive';

jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
  };
});

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

import { UserMenu } from './UserMenu';

describe('UserMenu', () => {
  const baseProps = {
    userInfo: {
      displayName: 'John Doe',
      isNFP: true,
    },
    openSelfService: jest.fn(),
    events2Rate: [{ id: 1, Title: 'Event A' }],
    events2Approve: [{ id: 2, Title: 'Event B' }],
    openRating: jest.fn(),
    openApproval: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders display name on desktop', () => {
    useMediaQuery.mockReturnValue(false);

    const html = renderToStaticMarkup(<UserMenu {...baseProps} />);

    expect(html).toContain('John Doe');
    expect(html).toContain('user-menu-button');
  });

  test('hides display name on mobile', () => {
    useMediaQuery.mockReturnValue(true);

    const html = renderToStaticMarkup(<UserMenu {...baseProps} />);

    expect(html).not.toContain('John Doe');
    expect(html).toContain('user-menu-button');
  });
});
