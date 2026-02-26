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
import { getMe } from '../data/provider';
import { getCountries, getCurrentParticipant, getParticipants } from '../data/sharepointProvider';

jest.mock('./Tab.scss', () => ({}));

jest.mock('@mui/material/styles', () => ({
  ThemeProvider: ({ children }) => <>{children}</>,
  createTheme: () => ({
    breakpoints: {
      up: () => '@media (min-width: 600px)',
    },
  }),
}));

const mockMenuItem = jest.fn(({ children }) => <button>{children}</button>);
const mockIconButton = jest.fn(({ children }) => <button>{children}</button>);
const mockAutocomplete = jest.fn(({ renderInput, renderOption, options, onChange }) => {
  if (onChange && options?.[0]) {
    onChange(null, options[0]);
  }
  return (
    <div>
      {renderInput ? renderInput({}) : null}
      {options && options[0] && renderOption ? renderOption({}, options[0]) : null}
    </div>
  );
});

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const Menu = ({ open, children }) => (open ? <div>{children}</div> : null);
  const Dialog = ({ open, children }) => (open ? <div>{children}</div> : null);

  return {
    Backdrop: passthrough(),
    CircularProgress: passthrough('span'),
    AppBar: passthrough('header'),
    Toolbar: passthrough(),
    Menu,
    MenuItem: (props) => mockMenuItem(props),
    Typography: passthrough('span'),
    Autocomplete: (props) => mockAutocomplete(props),
    Box: passthrough(),
    TextField: passthrough('input'),
    Paper: passthrough(),
    Dialog,
    DialogTitle: passthrough(),
    IconButton: (props) => mockIconButton(props),
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

const mockActivity = jest.fn(() => <div>activity-component</div>);
jest.mock('./activity/Activity', () => ({
  Activity: (props) => mockActivity(props),
}));

jest.mock('./my_country/MyCountry', () => ({
  MyCountry: () => <div>my-country-component</div>,
}));

jest.mock('./self_service/UserEdit', () => ({
  UserEdit: () => <div>user-edit-component</div>,
}));

const mockApprovalDialog = jest.fn(({ open }) => <div>{open ? 'approval-open' : 'approval-closed'}</div>);
jest.mock('./event_registration/ApprovalDialog', () => ({
  ApprovalDialog: (props) => mockApprovalDialog(props),
}));

const mockEventRatingDialog = jest.fn(({ open }) => <div>{open ? 'rating-open' : 'rating-closed'}</div>);
jest.mock('./event_rating/EventRatingDialog', () => ({
  EventRatingDialog: (props) => mockEventRatingDialog(props),
}));

jest.mock('./HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html || ''}</div>,
}));

const mockUserMenu = jest.fn(() => <div>user-menu-component</div>);
jest.mock('./UserMenu', () => ({
  UserMenu: (props) => mockUserMenu(props),
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

  test('runs initialization effect and can change country for admin users', async () => {
    useMediaQuery.mockReturnValue(false);
    useConfiguration.mockReturnValue({ DashboardVersion: '2.0.0' });
    getMe.mockResolvedValue({
      isAdmin: true,
      isNFP: false,
      isGuest: false,
      country: 'EL',
      isEionetUser: true,
      mail: 'user@example.org',
      displayName: 'User',
      givenName: 'Given',
      surname: 'Name',
    });
    getCountries.mockResolvedValue(['EL', 'RO']);

    React.useEffect.mockImplementation((fn) => {
      fn();
    });

    mockStateSequence([
      { isLoaded: false },
      {},
      { event2Approve: [], events2Rate: [], allEvents: [] },
      true,
      'EL',
      ['EL', 'RO'],
      true,
      false,
      {},
      {},
      false,
      false,
      false,
      true,
      1,
      null,
    ]);

    const html = renderToStaticMarkup(<Tab />);
    await Promise.resolve();
    await Promise.resolve();

    expect(getMe).toHaveBeenCalled();
    expect(getCountries).toHaveBeenCalled();
    expect(html).toContain('flagcdn.com/h20/gr.png');
    expect(html).toContain('flagcdn.com/w20/gr.png');
  });

  test('wires menu and dialog handlers through child props', async () => {
    useMediaQuery.mockReturnValue(false);
    useConfiguration.mockReturnValue({});
    getCurrentParticipant.mockResolvedValue({ id: 'participant' });
    getParticipants.mockResolvedValue([{ id: 'p1' }]);

    const selectedEvent = { id: 10, Title: 'Event X', HasVoted: false, AllowVote: true };
    mockStateSequence([
      {
        isAdmin: false,
        isNFP: true,
        isGuest: false,
        country: 'RO',
        isLoaded: true,
        isEionetUser: true,
        mail: 'user@example.org',
      },
      { isLoaded: true },
      { event2Approve: [], events2Rate: [], allEvents: [{ id: 1, IsUpcoming: false, AllowVote: true }] },
      true,
      'RO',
      ['RO'],
      false,
      false,
      {},
      selectedEvent,
      true,
      true,
      true,
      false,
      1,
      null,
    ]);

    renderToStaticMarkup(<Tab />);

    await mockUserMenu.mock.calls[0][0].openRating({ id: 10, Title: 'Event X' });
    await mockUserMenu.mock.calls[0][0].openApproval({ id: 10, Title: 'Event X' });
    mockApprovalDialog.mock.calls[0][0].handleClose();
    mockEventRatingDialog.mock.calls[0][0].handleClose(true);
    mockUserMenu.mock.calls[0][0].openSelfService();
    mockMenuItem.mock.calls[0][0].onClick();
    mockMenuItem.mock.calls[1][0].onClick();

    expect(getCurrentParticipant).toHaveBeenCalledTimes(2);
    expect(getParticipants).toHaveBeenCalledWith(10, 'RO');
    expect(selectedEvent.HasVoted).toBe(true);
    expect(selectedEvent.AllowVote).toBe(false);
  });

  test('handles mobile menu and drawer callbacks', () => {
    useMediaQuery.mockReturnValue(true);
    useConfiguration.mockReturnValue({});

    mockStateSequence([
      {
        isAdmin: false,
        isNFP: false,
        isGuest: false,
        country: 'IO',
        isLoaded: true,
        isEionetUser: true,
      },
      { isLoaded: true },
      { event2Approve: [], events2Rate: [], allEvents: [] },
      true,
      'IO',
      ['IO'],
      false,
      false,
      {},
      {},
      false,
      false,
      false,
      true,
      1,
      { id: 'anchor' },
    ]);

    const html = renderToStaticMarkup(<Tab />);

    mockIconButton.mock.calls[0][0].onClick();
    mockIconButton.mock.calls[1][0].onClick({ currentTarget: { id: 'new-anchor' } });
    mockMenuItem.mock.calls[0][0].onClick();
    mockMenuItem.mock.calls[1][0].onClick();

    expect(html).not.toContain('flagcdn.com/h20/.png');
  });
});
