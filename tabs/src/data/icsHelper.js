import { createEvent } from 'ics';
import { differenceInMinutes, format } from 'date-fns';

export function createIcs(meeting) {
  let result = undefined,
    duration = undefined;
  const meetingStart = new Date(meeting.MeetingStart);
  const durationInMinutes = differenceInMinutes(new Date(meeting.MeetingEnd), meetingStart);
  if (durationInMinutes >= 60) {
    duration = {
      hours: Math.floor(durationInMinutes / 60),
      minutes: durationInMinutes % 60,
    };
  } else {
    duration = {
      minutes: durationInMinutes,
    };
  }
  const event = {
    start: format(meetingStart, 'yyyy-M-d-H-m').split('-').map(Number),
    duration: duration,
    title: meeting.Title,
    organizer: { name: 'EEA' },
    ...(meeting.MeetingLink && { url: meeting.MeetingLink }),
  };

  createEvent(event, (error, value) => {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    result = blob;
  });

  return result;
}
