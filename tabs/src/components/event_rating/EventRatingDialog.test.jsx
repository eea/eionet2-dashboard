import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventRatingDialog } from './EventRatingDialog';

jest.mock('../../data/hooks/useConfiguration', () => ({
  useConfiguration: () => ({ DateFormatDashboard: 'dd-MMM-yyyy' }),
}));
jest.mock('../event_rating/EventRating', () => ({
  EventRating: () => <div>event-rating-content</div>,
}));
jest.mock('../EventDialogTitle', () => ({
  EventDialogTitle: () => <div>event-dialog-title</div>,
}));

describe('EventRatingDialog', () => {
  test('renders title and rating component', () => {
    const html = renderToStaticMarkup(
      <EventRatingDialog
        open={true}
        handleClose={jest.fn()}
        event={{ Title: 'Event 1', MeetingStart: new Date(), MeetingEnd: new Date() }}
        participant={{}}
      />,
    );

    expect(html).toContain('MuiDialog-root');
  });
});
