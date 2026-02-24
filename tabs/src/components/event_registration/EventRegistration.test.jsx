import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventRegistration } from './EventRegistration';
import {
  postParticipant,
  patchParticipant,
  deleteParticipant,
} from '../../data/sharepointProvider';

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
    Alert: passthrough(),
  };
});

jest.mock('@mui/icons-material/Check', () => () => <span>check-icon</span>);
jest.mock('@mui/icons-material/Save', () => () => <span>save-icon</span>);

jest.mock('../../data/hooks/useConfiguration', () => ({
  useConfiguration: () => ({ EventRegistrationInfo: 'Registration info' }),
}));

jest.mock('../../data/sharepointProvider', () => ({
  postParticipant: jest.fn(),
  patchParticipant: jest.fn(),
  deleteParticipant: jest.fn(),
}));

jest.mock('../HtmlBox', () => ({
  HtmlBox: ({ html }) => <div>{html}</div>,
}));

describe('EventRegistration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    buttonHandlers.length = 0;
  });

  test('renders registration form and action buttons for registered offline event', () => {
    const html = renderToStaticMarkup(
      <EventRegistration
        participant={{
          id: 1,
          ParticipantName: 'User 1',
          Email: 'user1@example.org',
          Country: 'RO',
          Registered: true,
          PhysicalParticipation: true,
          EEAReimbursementRequested: false,
          CustomMeetingRequest: '',
        }}
        event={{
          IsOffline: true,
          Participants: [],
          CustomMeetingRequest: 'Bring badge',
        }}
      />,
    );

    expect(html).toContain('Registration info');
    expect(html).toContain('Update registration');
    expect(html).toContain('Unregister');
    expect(html).toContain('Physical participation');
    expect(html).toContain('Reimbursement requested');
  });

  test('register flow posts participant and updates event counters', async () => {
    const participant = {
      ParticipantName: 'User 2',
      Email: 'user2@example.org',
      Country: 'RO',
      Registered: false,
      PhysicalParticipation: false,
      EEAReimbursementRequested: false,
      CustomMeetingRequest: '',
    };
    const event = {
      IsOffline: true,
      HasRegistered: false,
      NoOfRegistered: 0,
      Participants: [{ Registered: true }, { Registered: false }],
      CustomMeetingRequest: '',
    };

    postParticipant.mockResolvedValue({ id: 55 });

    renderToStaticMarkup(<EventRegistration participant={participant} event={event} />);

    const register = buttonHandlers.find((b) => b.label === 'Register');
    expect(register).toBeDefined();

    await register.onClick();

    expect(postParticipant).toHaveBeenCalledWith(participant, event);
    expect(participant.Registered).toBe(true);
    expect(participant.id).toBe(55);
    expect(event.HasRegistered).toBe(true);
    expect(event.NoOfRegistered).toBe(2);
    expect(event.Participants.length).toBe(3);
  });

  test('update and unregister flows call patch and delete', async () => {
    const participant = {
      id: 10,
      ParticipantName: 'User 3',
      Email: 'user3@example.org',
      Country: 'RO',
      Registered: true,
      NFPApproved: 'Yes',
      PhysicalParticipation: true,
      EEAReimbursementRequested: true,
      CustomMeetingRequest: '',
    };
    const event = {
      IsOffline: true,
      HasRegistered: true,
      NoOfRegistered: 1,
      Participants: [participant],
      CustomMeetingRequest: '',
    };

    patchParticipant.mockResolvedValue({});
    deleteParticipant.mockResolvedValue({});

    renderToStaticMarkup(<EventRegistration participant={participant} event={event} />);

    const update = buttonHandlers.find((b) => b.label === 'Update registration');
    const unregister = buttonHandlers.find((b) => b.label === 'Unregister');

    expect(update).toBeDefined();
    expect(unregister).toBeDefined();

    await update.onClick();
    expect(patchParticipant).toHaveBeenCalledWith(participant, event);
    expect(participant.NFPApproved).toBe('No value');
    expect(event.HasRegistered).toBe(true);

    await unregister.onClick();
    expect(deleteParticipant).toHaveBeenCalledWith(participant, event);
    expect(participant.Registered).toBe(false);
    expect(event.HasRegistered).toBe(false);
    expect(event.NoOfRegistered).toBe(0);
  });

  test('online event hides offline-only controls', () => {
    const html = renderToStaticMarkup(
      <EventRegistration
        participant={{
          ParticipantName: 'User 4',
          Email: 'user4@example.org',
          Country: 'RO',
          Registered: false,
          PhysicalParticipation: false,
          EEAReimbursementRequested: false,
          CustomMeetingRequest: '',
        }}
        event={{
          IsOffline: false,
          Participants: [],
          CustomMeetingRequest: 'ignored',
        }}
      />,
    );

    expect(html).not.toContain('Physical participation');
    expect(html).not.toContain('Reimbursement requested');
    expect(html).toContain('Register');
  });
});
