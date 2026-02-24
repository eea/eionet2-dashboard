import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventList } from './EventList';

jest.mock('../ResizableGrid', () => ({
  __esModule: true,
  default: ({ rows }) => <div>grid-rows-{rows?.length || 0}</div>,
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
  test('renders upcoming meetings grid for tab 0', () => {
    const html = renderToStaticMarkup(
      <EventList
        userInfo={{ country: 'RO', isEionetUser: true, isNFP: true }}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        pastMeetings={[]}
        currentMeetings={[]}
        upcomingMeetings={[{ id: 1, Title: 'Upcoming meeting' }]}
        tabsValue={0}
        openRating={jest.fn()}
        openApproval={jest.fn()}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });

  test('renders current meetings grid for tab 1', () => {
    const html = renderToStaticMarkup(
      <EventList
        userInfo={{ country: 'RO', isEionetUser: true, isNFP: false }}
        configuration={{ DateFormatDashboard: 'dd-MMM-yyyy' }}
        pastMeetings={[]}
        currentMeetings={[{ id: 2, Title: 'Current meeting' }]}
        upcomingMeetings={[]}
        tabsValue={1}
        openRating={jest.fn()}
        openApproval={jest.fn()}
      />,
    );

    expect(html).toContain('grid-rows-1');
  });
});
