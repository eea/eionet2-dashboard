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
import { Activity } from './Activity';
import {
  getConsultations,
  getMeetings,
  getPublications,
  getObligations,
} from '../../data/sharepointProvider';
import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

jest.mock('./activity.scss', () => ({}));

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
    CircularProgress: passthrough('span'),
    Box: passthrough(),
    ListItem: passthrough(),
    ListItemIcon: passthrough(),
    ListItemText: ({ primary }) => <div>{primary}</div>,
    ListItemButton,
  };
});

jest.mock('@mui/icons-material/Loop', () => () => <span>loop-icon</span>);
jest.mock('@mui/icons-material/FastForwardOutlined', () => () => <span>fast-forward-icon</span>);
jest.mock('@mui/icons-material/HistoryOutlined', () => () => <span>history-icon</span>);
jest.mock('@mui/icons-material/NextPlanOutlined', () => () => <span>next-plan-icon</span>);

jest.mock('./ConsultationList', () => ({
  ConsultationList: () => <div>consultation-list</div>,
}));
jest.mock('./EventList', () => ({
  EventList: () => <div>event-list</div>,
}));
jest.mock('./PublicationList', () => ({
  PublicatonList: () => <div>publication-list</div>,
}));
jest.mock('./ObligationList', () => ({
  ObligationList: () => <div>obligation-list</div>,
}));

jest.mock('../CustomDrawer', () => ({
  __esModule: true,
  default: ({ drawerOptions }) => <div>{drawerOptions}</div>,
}));

jest.mock('../../data/sharepointProvider', () => ({
  getConsultations: jest.fn(),
  getMeetings: jest.fn(),
  getPublications: jest.fn(),
  getObligations: jest.fn(),
}));

jest.mock('@microsoft/applicationinsights-react-js', () => ({
  useAppInsightsContext: jest.fn(),
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

function buildStates(tabsValue) {
  return [
    tabsValue,
    [{ id: 'past' }],
    [{ id: 'current' }],
    [{ id: 'upcoming' }],
    [{ id: 'open-consultation' }],
    [{ id: 'review-consultation' }],
    [{ id: 'final-consultation' }],
    [{ id: 'future-consultation' }],
    [{ id: 'open-survey' }],
    [{ id: 'review-survey' }],
    [{ id: 'final-survey' }],
    [{ id: 'future-survey' }],
    [{ id: 'future-publication' }],
    [{ id: 'past-publication' }],
    [{ id: 'upcoming-obligation' }],
    [{ id: 'continuous-obligation' }],
    false,
  ];
}

describe('Activity', () => {
  const trackEvent = jest.fn();
  const closeDrawer = jest.fn();

  const baseProps = {
    userInfo: { country: 'RO', isEionetUser: true, isNFP: true },
    country: 'RO',
    configuration: { DashboardNumberOfMonthsData: 24, PublicationsType: 'Report;Article' },
    setData4Menu: jest.fn(),
    openRating: jest.fn(),
    openApproval: jest.fn(),
    drawerOpen: true,
    closeDrawer,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    React.useCallback.mockImplementation((fn) => fn);
    React.useEffect.mockImplementation((fn) => fn());
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);

    useAppInsightsContext.mockReturnValue({ trackEvent });

    getMeetings.mockResolvedValue([{ IsCurrent: true }, { IsUpcoming: true }, { IsPast: true }]);
    getConsultations.mockResolvedValue([]);
    getPublications.mockResolvedValue([{ ItemType: 'Report', IsPast: false }]);
    getObligations.mockResolvedValue([{ IsUpcoming: true, IsContinuous: false }]);
  });

  test('renders drawer sections and event tab by default', () => {
    mockStateSequence(buildStates(0));

    const html = renderToStaticMarkup(<Activity {...baseProps} />);

    expect(html).toContain('EVENTS');
    expect(html).toContain('CONSULTATIONS');
    expect(html).toContain('ENQUIRIES');
    expect(html).toContain('PUBLICATIONS &amp; OUTREACH');
    expect(html).toContain('REPORTING OBLIGATIONS');
    expect(html).toContain('event-list');
    expect(closeDrawer).toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalled();
  });

  test('renders consultations view for consultation tabs', () => {
    mockStateSequence(buildStates(4));

    const html = renderToStaticMarkup(<Activity {...baseProps} />);

    expect(html).toContain('consultation-list');
  });

  test('renders surveys view for enquiries tabs', () => {
    mockStateSequence(buildStates(8));

    const html = renderToStaticMarkup(<Activity {...baseProps} />);

    expect(html).toContain('consultation-list');
  });

  test('renders publications view', () => {
    mockStateSequence(buildStates(11));

    const html = renderToStaticMarkup(<Activity {...baseProps} />);

    expect(html).toContain('publication-list');
  });

  test('renders obligations view', () => {
    mockStateSequence(buildStates(13));

    const html = renderToStaticMarkup(<Activity {...baseProps} />);

    expect(html).toContain('obligation-list');
  });

  test('loads activity data in effect', async () => {
    mockStateSequence(buildStates(0));

    renderToStaticMarkup(<Activity {...baseProps} />);
    await Promise.resolve();
    await Promise.resolve();

    expect(getMeetings).toHaveBeenCalled();
    expect(getConsultations).toHaveBeenCalled();
    expect(getPublications).toHaveBeenCalled();
    expect(getObligations).toHaveBeenCalled();
    expect(baseProps.setData4Menu).toHaveBeenCalled();
  });

  test('handles meeting loading errors', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    getMeetings.mockRejectedValue(new Error('boom'));
    mockStateSequence(buildStates(0));

    renderToStaticMarkup(<Activity {...baseProps} />);
    await Promise.resolve();
    await Promise.resolve();

    expect(logSpy).toHaveBeenCalledWith('boom');
    logSpy.mockRestore();
  });
});
