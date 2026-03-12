import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { EventDialogTitle } from './EventDialogTitle';

jest.mock('../data/hooks/useConfiguration', () => ({
  useConfiguration: jest.fn(() => ({})),
}));

describe('EventDialogTitle', () => {
  test('renders dialog title and event title', () => {
    const html = renderToStaticMarkup(
      <EventDialogTitle
        title="Registration"
        event={{
          Title: 'Climate meeting',
          MeetingStart: new Date('2025-01-01T10:00:00Z'),
          MeetingEnd: new Date('2025-01-01T11:00:00Z'),
        }}
      />,
    );

    expect(html).toContain('Registration');
    expect(html).toContain('Event: Climate meeting');
  });
});
