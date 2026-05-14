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
const fieldHandlers = {};
const checkboxHandlers = [];
const stateSetters = [];

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
    Checkbox: ({ onChange, checked, disabled }) => {
      checkboxHandlers.push({ onChange, checked, disabled });
      return ReactLocal.createElement('input', { type: 'checkbox' });
    },
    TextField: ({ label, id, onChange, onBlur }) => {
      if (id) {
        fieldHandlers[id] = { onChange, onBlur };
      }
      return <div>{label || ''}</div>;
    },
    Button: ({ onClick, children, endIcon }) => {
      const label = labelToText(children);
      if (onClick) {
        buttonHandlers.push({ label, onClick });
      }
      return (
        <button>
          {children}
          {endIcon}
        </button>
      );
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
  stateSetters.length = 0;
  React.useState.mockImplementation((initialValue) => {
    const setter = jest.fn();
    stateSetters.push(setter);
    if (index < values.length) {
      const current = values[index];
      index += 1;
      return [current, setter];
    }
    return [initialValue, setter];
  });
}

function buildState(participantOverride = {}, overrides = {}) {
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

  return [
    participant,
    overrides.loading ?? false,
    overrides.errorText ?? '',
    overrides.errors ?? {},
    overrides.successRegister ?? false,
    overrides.physical ?? false,
    overrides.reimbursement ?? false,
  ];
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
    checkboxHandlers.length = 0;
    stateSetters.length = 0;
    Object.keys(fieldHandlers).forEach((k) => delete fieldHandlers[k]);
    React.useState.mockImplementation((initialValue) => {
      const setter = jest.fn();
      stateSetters.push(setter);
      return [initialValue, setter];
    });
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

  test('rejects emails containing a plus sign', async () => {
    const state = buildState({ Email: 'user+alias@example.org', ParticipantName: 'Valid Name' });
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(getUserByMail).not.toHaveBeenCalled();
    expect(postParticipant).not.toHaveBeenCalled();
  });

  test('skips registration when required fields are empty', async () => {
    const event = { ...baseEvent, Participants: [] };
    const state = buildState({ ParticipantName: '', Email: '' });
    mockStateSequence(state);

    renderToStaticMarkup(<EventExternalRegistration event={event} userInfo={{ country: 'RO' }} />);

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(getUserByMail).not.toHaveBeenCalled();
    expect(postParticipant).not.toHaveBeenCalled();
    expect(event.Participants.length).toBe(0);
  });

  test('does not mutate event when postParticipant returns no response', async () => {
    postParticipant.mockResolvedValueOnce(undefined);
    const event = { ...baseEvent, Participants: [] };
    const state = buildState({ Email: 'new@example.org', ParticipantName: 'New One' });
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(<EventExternalRegistration event={event} userInfo={{ country: 'RO' }} />);

    const register = buttonHandlers.find((b) => b.label === 'Register');
    await register.onClick();

    expect(postParticipant).toHaveBeenCalled();
    expect(participant.id).toBeUndefined();
    expect(event.Participants.length).toBe(0);
  });

  test('field onChange handlers mutate the participant', () => {
    const state = buildState();
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    fieldHandlers.name.onChange({ target: { value: 'Jane Roe' } });
    fieldHandlers.email.onChange({ target: { value: 'jane.roe@example.org' } });

    expect(participant.ParticipantName).toBe('Jane Roe');
    expect(participant.Email).toBe('jane.roe@example.org');
  });

  test('validateField records a name error on blur of an empty name field', () => {
    const state = buildState({ ParticipantName: '' });
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    const setErrors = stateSetters[3];
    fieldHandlers.name.onBlur({ target: { id: 'name' } });

    expect(setErrors).toHaveBeenCalled();
    expect(setErrors.mock.calls[0][0].name).toBeTruthy();
  });

  test('validateField records an email error on blur of an empty email field', () => {
    const state = buildState({ Email: '' });
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    const setErrors = stateSetters[3];
    fieldHandlers.email.onBlur({ target: { id: 'email' } });

    expect(setErrors).toHaveBeenCalled();
    expect(setErrors.mock.calls[0][0].email).toBeTruthy();
  });

  test('validateField logs a warning for an unknown field id', () => {
    mockStateSequence(buildState());
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    fieldHandlers.name.onBlur({ target: { id: 'unknown' } });

    expect(logSpy).toHaveBeenCalledWith('Undefined field for validation');
    logSpy.mockRestore();
  });

  test('checking physical participation updates the participant', () => {
    const state = buildState();
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    checkboxHandlers[0].onChange({}, true);

    expect(participant.PhysicalParticipation).toBe(true);
    expect(stateSetters[5]).toHaveBeenCalledWith(true);
  });

  test('unchecking physical participation also resets reimbursement', () => {
    const state = buildState(
      { PhysicalParticipation: true, EEAReimbursementRequested: true },
      { physical: true, reimbursement: true },
    );
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    checkboxHandlers[0].onChange({}, false);

    expect(participant.PhysicalParticipation).toBe(false);
    expect(participant.EEAReimbursementRequested).toBe(false);
    expect(stateSetters[6]).toHaveBeenCalledWith(false);
  });

  test('checking reimbursement updates the participant', () => {
    const state = buildState({ PhysicalParticipation: true }, { physical: true });
    const participant = state[0];
    mockStateSequence(state);

    renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    checkboxHandlers[1].onChange({}, true);

    expect(participant.EEAReimbursementRequested).toBe(true);
    expect(stateSetters[6]).toHaveBeenCalledWith(true);
  });

  test('does not render offline checkboxes when the event is online', () => {
    mockStateSequence(buildState());

    renderToStaticMarkup(
      <EventExternalRegistration
        event={{ ...baseEvent, IsOffline: false }}
        userInfo={{ country: 'RO' }}
      />,
    );

    expect(checkboxHandlers).toHaveLength(0);
  });

  test('renders the error alert when errorText is set', () => {
    mockStateSequence(buildState({}, { errorText: 'Something went wrong' }));

    const html = renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    expect(html).toContain('Something went wrong');
  });

  test('renders the success alert with a check icon when registration succeeded', () => {
    mockStateSequence(buildState({}, { successRegister: true }));

    const html = renderToStaticMarkup(
      <EventExternalRegistration event={{ ...baseEvent }} userInfo={{ country: 'RO' }} />,
    );

    expect(html).toContain('Invitation success');
    expect(html).toContain('check-icon');
  });
});
