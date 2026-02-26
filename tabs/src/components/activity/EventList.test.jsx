import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventList } from './EventList';

let mockGridProps;

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: (props) => {
    mockGridProps = props;
    return <div>grid-rows-{props.rows?.length || 0}</div>;
  },
}));

jest.mock('./GroupsTags', () => ({
  GroupsTags: ({ groups }) => <div>groups-{groups?.length || 0}</div>,
}));

jest.mock('../event_registration/EventRegistration', () => ({
  EventRegistration: () => <div>event-registration</div>,
}));

jest.mock('../event_registration/EventExternalRegistration', () => ({
  EventExternalRegistration: () => <div>event-external-registration</div>,
}));

jest.mock('../EventDialogTitle', () => ({
  EventDialogTitle: () => <div>event-dialog-title</div>,
}));

jest.mock('../../data/sharepointProvider', () => ({
  getCurrentParticipant: jest.fn(),
}));

jest.mock('../../static/images/teams-icon.svg', () => ({
  ReactComponent: () => <svg />,
}));

describe('EventList', () => {
  beforeEach(() => {
    mockGridProps = null;
  });

  test('renders upcoming meetings grid for tab 0', () => {
    const html = renderToStaticMarkup(
      <EventList
        userInfo={{ country: 'RO', isEionetUser: true, isNFP: true }}
        configuration={{
          DateFormatDashboard: 'dd-MMM-yyyy',
          RegisterEventButtonTooltip: 'register',
          RegisterOthersButtonTooltip: 'register others',
        }}
        pastMeetings={[]}
        currentMeetings={[]}
        upcomingMeetings={[
          {
            id: 1,
            Title: 'Upcoming meeting',
            MeetingType: 'Physical',
            NoOfRegistered: 2,
            IsUpcoming: true,
          },
        ]}
        tabsValue={0}
        openRating={jest.fn()}
        openApproval={jest.fn()}
      />,
    );

    expect(html).toContain('grid-rows-1');
    expect(mockGridProps.columns.some((column) => column.field === 'MeetingRegistrationLink')).toBe(
      true,
    );
    expect(mockGridProps.columns.some((column) => column.field === 'Approval')).toBe(true);
    expect(mockGridProps.columns.some((column) => column.field === 'id')).toBe(true);
    expect(mockGridProps.columns.some((column) => column.field === 'NoOfRegistered')).toBe(true);

    const registerColumn = mockGridProps.columns.find(
      (column) => column.field === 'MeetingRegistrationLink',
    );
    const registerHtml = renderToStaticMarkup(
      registerColumn.renderCell({ row: { MeetingType: 'physical', MeetingLink: '' } }),
    );
    expect(registerHtml).toContain('button');
  });

  test('renders current meetings grid for tab 1', () => {
    const html = renderToStaticMarkup(
      <EventList
        userInfo={{ country: 'RO', isEionetUser: true, isNFP: true }}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy', JoinEventButtonTooltip: 'join' }}
        pastMeetings={[]}
        currentMeetings={[
          {
            id: 2,
            Title: 'Current meeting',
            MeetingType: 'Online',
            MeetingLink: 'https://example.org/meeting',
            NoOfRegistered: 3,
            IsCurrent: true,
            AllowVote: true,
            HasVoted: true,
            MeetingStart: new Date('2026-01-01'),
          },
        ]}
        upcomingMeetings={[]}
        tabsValue={1}
        openRating={jest.fn()}
        openApproval={jest.fn()}
      />,
    );

    expect(html).toContain('grid-rows-1');
    expect(mockGridProps.columns.some((column) => column.field === 'MeetingLink')).toBe(true);
    expect(mockGridProps.columns.some((column) => column.field === 'AllowVote')).toBe(true);

    const ratingColumn = mockGridProps.columns.find((column) => column.field === 'AllowVote');
    const ratingHtml = renderToStaticMarkup(
      ratingColumn.renderCell({ row: { AllowVote: true, HasVoted: true } }),
    );
    expect(ratingHtml).toContain('button');
  });

  test('renders past meetings grid for tab 2 with participants and no rating for missing country', () => {
    const html = renderToStaticMarkup(
      <EventList
        userInfo={{ country: '', isEionetUser: false, isNFP: false }}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy', NoOfParticipantsTooltip: 'participants' }}
        pastMeetings={[
          {
            id: 3,
            Title: 'Past meeting',
            IsPast: true,
            NoOfParticipants: 0,
            MeetingStart: new Date('2026-01-01'),
            MeetingEnd: new Date('2026-01-02'),
          },
        ]}
        currentMeetings={[]}
        upcomingMeetings={[]}
        tabsValue={2}
        openRating={jest.fn()}
        openApproval={jest.fn()}
      />,
    );

    expect(html).toContain('grid-rows-1');
    expect(mockGridProps.columns.some((column) => column.field === 'NoOfParticipants')).toBe(true);
    expect(mockGridProps.columns.some((column) => column.field === 'AllowVote')).toBe(false);

    const participantsColumn = mockGridProps.columns.find(
      (column) => column.field === 'NoOfParticipants',
    );
    const participantsHtml = renderToStaticMarkup(
      participantsColumn.renderCell({
        row: { IsPast: true, NoOfParticipants: 0, ParticipantsUrl: '' },
      }),
    );
    expect(participantsHtml).toContain('N/A');
  });
});
