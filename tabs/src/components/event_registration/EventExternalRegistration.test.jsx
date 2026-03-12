jest.mock('react', () => {
  const actual = jest.requireActual('react');
  return {
    ...actual,
    React: actual,
    useState: jest.fn(actual.useState),
  };
});

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventExternalRegistration } from './EventExternalRegistration';
import { postParticipant } from '../../data/sharepointProvider';
import { getUserByMail } from '../../data/provider';

const buttonHandlers = [];

jest.mock('@mui/material', () => {
  const ReactLocal = require('react');
  const passthrough =
    (Tag = 'div') =>
    ({ children }) =>
      ReactLocal.createElement(Tag, {}, children);

  const labelToText = (children) => {
    if (typeof children === 'string') {
      return children;
    }
    if (Array.isArray(children)) {
      return children
        .filter((v) => typeof v === 'string')
        .join(' ')
        .trim();
    }
    return '';
  };

  return {
    Alert: passthrough(),
    Box: passthrough(),
    Checkbox: passthrough('input'),
    TextField: ({ label }) => <div>{label || ''}</div>,
    Button: ({ onClick, children }) => {
      const label = labelToText(children);
      if (onClick) {
        buttonHandlers.push({ label, onClick });
      }
      return <button>{children}</button>;
    },
    FormControlLabel: ({ label, control }) => (
      <div>
        {label}
        {control}
      </div>
    ),
    CircularProgress: passthrough('span'),
    Backdrop: passthrough(),
  };
});

jest.mock('@mui/icons-material/Check', () => () => <span>check-icon</span>);
jest.mock('@mui/icons-material/Save', () => () => <span>save-icon</span>);

jest.mock('../../data/hooks/useConfiguration', () => ({
  useConfiguration: () => ({
    NFPInvitationInfoMessage: 'Invitation info',
    NFPInvitationSuccessMessage: 'Invitation success',
    EventInvitationByNFPError: 'Already invited',
  }),
}));

jest.mock('../../data/sharepointProvider', () => ({
  postParticipant: jest.fn(),
}));

jest.mock('../../data/provider', () => ({
  getUserByMail: jest.fn(),
}));

jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
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

function buildState(participantOverride = {}) {
  const participant = {
    MeetingId: 1,
    ParticipantName: 'John Doe',
    Email: 'john@example.org',
    PhysicalParticipation: false,
    EEAReimbursementRequested: false,
    Registered: true,
    RegistrationDate: new Date('2025-01-01'),
    Country: 'RO',
    NFPApproved: 'Approved',
    CustomMeetingRequest: 'Registered by NFP',
    IsInvitedByNFP: true,
    ...participantOverride,
  };

  return [participant, false, '', {}, false, false, false];
}

describe('EventExternalRegistration', () => {
  const baseEvent = {
    id: 1,
    IsOffline: true,
    Participants: [],
    NoOfRegistered: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    buttonHandlers.length = 0;
    React.useState.mockImplementation((initialValue) => [initialValue, jest.fn()]);
    getUserByMail.mockResolvedValue(null);
    postParticipant.mockResolvedValue({ id: 77 });
  });

  test('renders external registration form', () => {
    mockStateSequence(buildState());

    const html = renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    expect(html).toContain('Invitation info');
    expect(html).toContain('Register');
    expect(html).toContain('Physical participation');
    expect(html).toContain('Reimbursement requested');
  });

  test('successfully registers external participant', async () => {
    const event = {
      ...baseEvent,
      Participants: [
        { Email: 'a@x.org', Registered: true },
        { Email: 'b@x.org', Registered: false },
      ],
    };

    const state = buildState({ Email: 'new.user@domain.org', ParticipantName: 'New User' });
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(<EventExternalRegistration event={event} userInfo={{ country: 'RO' }} />);

    const register = buttonHandlers.find((b) => b.label === 'Register');
    expect(register).toBeDefined();

    await register.onClick();

    expect(getUserByMail).toHaveBeenCalledWith('new.user@domain.org');
    expect(postParticipant).toHaveBeenCalledWith(participant, event);
    expect(participant.id).toBe(77);
    expect(event.Participants.length).toBe(3);
    expect(event.NoOfRegistered).toBe(2);
  });

  test('does not post when email is invalid', async () => {
    const state = buildState({ Email: 'invalid-email', ParticipantName: 'Valid Name' });
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(getUserByMail).not.toHaveBeenCalled();
    expect(postParticipant).not.toHaveBeenCalled();
  });

  test('does not post EEA addresses', async () => {
    const state = buildState({ Email: 'user@eea.europa.eu', ParticipantName: 'Valid Name' });
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(getUserByMail).not.toHaveBeenCalled();
    expect(postParticipant).not.toHaveBeenCalled();
  });

  test('does not post when user exists or already invited', async () => {
    const event = {
      ...baseEvent,
      Participants: [{ Email: 'existing@domain.org', Registered: true }],
    };

    const state = buildState({ Email: 'existing@domain.org', ParticipantName: 'Valid Name' });
    mockStateSequence(state);
    getUserByMail.mockResolvedValue({ SharepointUser: true });

    renderToStaticMarkup(<EventExternalRegistration event={event} userInfo={{ country: 'RO' }} />);

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(getUserByMail).toHaveBeenCalledWith('existing@domain.org');
    expect(postParticipant).not.toHaveBeenCalled();
  });
});
