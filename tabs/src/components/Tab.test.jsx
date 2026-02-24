jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useState: jest.fn(actual.useState),
    useEffect: jest.fn(),
    useCallback: jest.fn((fn) => fn),
  };
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Tab from './Tab';
import { useMediaQuery } from 'react-responsive';
import { useConfiguration } from '../data/hooks/useConfiguration';

jest.mock('./Tab.scss', () => ({}));

jest.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }) => <>{children}</>,
  createTheme: () => ({
    breakpoints: {
      up: () => '@media (min-width: 600px)',
    },
  }),
}));

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const Menu = ({ open, children }) => (open ? <div>{children}</div> : null);
  const Dialog = ({ open, children }) => (open ? <div>{children}</div> : null);
  const Autocomplete = ({ renderInput }) => <div>{renderInput ? renderInput({}) : null}</div>;

  return {
    Backdrop: passthrough(),
    CircularProgress: passthrough('span'),
    AppBar: passthrough('header'),
    Toolbar: passthrough(),
    Menu,
    MenuItem: passthrough('button'),
    Typography: passthrough('span'),
    Autocomplete,
    Box: passthrough(),
    TextField: passthrough('input'),
    Paper: passthrough(),
    Dialog,
    DialogTitle: passthrough(),
    IconButton: passthrough('button'),
  };
});

jest.mock('@mui/icons-material/Close', () => () => <span>close-icon</span>);
jest.mock('@mui/icons-material/Menu', () => () => <span>menu-icon</span>);
jest.mock('@mui/icons-material/ChevronLeft', () => () => <span>chevron-left-icon</span>);
jest.mock('@mui/icons-material/Summarize', () => () => <span>summarize-icon</span>);

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('../data/provider', () => ({
  getMe: jest.fn(),
}));

jest.mock('../data/hooks/useConfiguration', () => ({
  useConfiguration: jest.fn(),
}));

jest.mock('../data/sharepointProvider', () => ({
  getCountries: jest.fn(),
  getCurrentParticipant: jest.fn(),
  getParticipants: jest.fn(),
}));

jest.mock('@microsoft/applicationinsights-react-js', () => ({
  AppInsightsContext: {
    Provider: ({ children }) => children,
  },
}));

jest.mock('../data/appInsights', () => ({
  reactPlugin: {},
}));

jest.mock('./BottomMenu', () => ({
  BottomMenu: () => <div>bottom-menu</div>,
}));

jest.mock('./activity/Activity', () => ({
  Activity: () => <div>activity-component</div>,
}));

jest.mock('./my_country/MyCountry', () => ({
  MyCountry: () => <div>my-country-component</div>,
}));

jest.mock('./self_service/UserEdit', () => ({
  UserEdit: () => <div>user-edit-component</div>,
}));

jest.mock('./event_registration/ApprovalDialog', () => ({
  ApprovalDialog: ({ open }) => <div>{open ? 'approval-open' : 'approval-closed'}</div>,
}));

jest.mock('./event_rating/EventRatingDialog', () => ({
  EventRatingDialog: ({ open }) => <div>{open ? 'rating-open' : 'rating-closed'}</div>,
}));

jest.mock('./HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html || ''}</div>,
}));

jest.mock('./UserMenu', () => ({
  UserMenu: () => <div>user-menu-component</div>,
}));

function mockStateSequence(values) {
  let index = 0;
  React.useState.mockImplementation((initialValue) => {
    if (index < values.length) {
      const next = values[index];
      index += 1;
      return [next, jest.fn()];
    }
    return [initialValue, jest.fn()];
  });
}

describe('Tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REACT_APP_VERSION = '1.0.0';
    React.useCallback.mockImplementation((fn) => fn);
    React.useEffect.mockImplementation(() => {});
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);
  });

  test('renders activity mode with open dialogs and version message', () => {
    useMediaQuery.mockReturnValue(false);
    useConfiguration.mockReturnValue({ AppVersionMessage: 'Please reload' });

    mockStateSequence([
      {
        isAdmin: false,
        isNFP: true,
        isGuest: false,
        country: 'RO',
        isLoaded: true,
        isEionetUser: true,
      },
      { isLoaded: true },
      { event2Approve: [{ id: 1 }], events2Rate: [{ id: 2 }], allEvents: [] },
      true,
      'RO',
      ['RO', 'DE'],
      true,
      false,
      { id: 1 },
      { Title: 'Event', HasVoted: false, AllowVote: true },
      true,
      true,
      true,
      false,
      1,
      null,
    ]);

    const html = renderToStaticMarkup(<Tab />);

    expect(html).toContain('activity-component');
    expect(html).toContain('approval-open');
    expect(html).toContain('rating-open');
    expect(html).toContain('Please reload');
    expect(html).toContain('user-menu-component');
    expect(html).toContain('bottom-menu');
  });

  test('renders my-country view when menu is set to 2', () => {
    useMediaQuery.mockReturnValue(false);
    useConfiguration.mockReturnValue({});

    mockStateSequence([
      {
        isAdmin: false,
        isNFP: false,
        isGuest: false,
        country: 'RO',
        isLoaded: true,
        isEionetUser: true,
      },
      { isLoaded: true },
      { event2Approve: [], events2Rate: [], allEvents: [] },
      true,
      'RO',
      ['RO'],
      false,
      false,
      {},
      {},
      false,
      false,
      false,
      true,
      2,
      null,
    ]);

    const html = renderToStaticMarkup(<Tab />);
    expect(html).toContain('my-country-component');
  });

  test('renders self service view when menu is set to 4', () => {
    useMediaQuery.mockReturnValue(false);
    useConfiguration.mockReturnValue({});

    mockStateSequence([
      {
        isAdmin: false,
        isNFP: false,
        isGuest: false,
        country: 'RO',
        isLoaded: true,
        isEionetUser: true,
      },
      { isLoaded: true, FirstName: 'User' },
      { event2Approve: [], events2Rate: [], allEvents: [] },
      true,
      'RO',
      ['RO'],
      false,
      false,
      {},
      {},
      false,
      false,
      false,
      true,
      4,
      null,
    ]);

    const html = renderToStaticMarkup(<Tab />);
    expect(html).toContain('user-edit-component');
  });

  test('renders mobile header controls', () => {
    useMediaQuery.mockReturnValue(true);
    useConfiguration.mockReturnValue({});

    mockStateSequence([
      {
        isAdmin: false,
        isNFP: false,
        isGuest: false,
        country: 'UK',
        isLoaded: true,
        isEionetUser: true,
      },
      { isLoaded: true },
      { event2Approve: [], events2Rate: [], allEvents: [] },
      true,
      'UK',
      ['UK'],
      false,
      false,
      {},
      {},
      false,
      false,
      false,
      false,
      1,
      null,
    ]);

    const html = renderToStaticMarkup(<Tab />);
    expect(html).toContain('menu-icon');
    expect(html).toContain('summarize-icon');
    expect(html).toContain('flagcdn.com/h20/gb.png');
  });
});
