jest.mock('ics', () => ({
  createEvent: jest.fn(),
}));

const { createEvent } = require('ics');
const { createIcs } = require('./icsHelper');

describe('createIcs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createEvent.mockImplementation((event, callback) => {
      callback(null, 'BEGIN:VCALENDAR');
    });
  });

  test('creates an event with hour/minute duration and meeting link', () => {
    const meeting = {
      MeetingStart: '2025-01-01T10:00:00.000Z',
      MeetingEnd: '2025-01-01T11:30:00.000Z',
      Title: 'Coordination meeting',
      MeetingLink: 'https://example.org/meeting',
    };
    const participant = {
      ParticipantName: 'Jane Doe',
      Email: 'jane@example.org',
    };

    const blob = createIcs(meeting, 'organizer@example.org', 'Line 1\nLine 2', participant);

    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'REQUEST',
        title: 'Coordination meeting',
        duration: { hours: 1, minutes: 30 },
        htmlContent: 'Line 1Line 2',
        url: 'https://example.org/meeting',
      }),
      expect.any(Function),
    );
    expect(blob).toBeInstanceOf(Blob);
  });

  test('creates an event with minutes-only duration and no url when link is missing', () => {
    const meeting = {
      MeetingStart: '2025-01-01T10:00:00.000Z',
      MeetingEnd: '2025-01-01T10:45:00.000Z',
      Title: 'Short meeting',
    };
    const participant = {
      ParticipantName: 'John Doe',
      Email: 'john@example.org',
    };

    createIcs(meeting, 'organizer@example.org', 'Description', participant);

    const eventArg = createEvent.mock.calls[0][0];
    expect(eventArg.duration).toEqual({ minutes: 45 });
    expect(eventArg.url).toBeUndefined();
  });
});
