/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { EventList } from '../components/activity/EventList';

describe('EventList', () => {
  const userInfo = {
      country: 'AT',
      isNFP: true,
    },
    configuration = {
      RatingColumnHeaderDescription: '',
    },
    meetings = [
      {
        id: 1,
        Title: 'Meeting 1',
        MeetingStart: new Date(),
        MeetingEnd: new Date(),
        Group: ['Group A'],
        HasRegistered: true,
        IsCurrent: true,
        MeetingLink: 'https://example.com/meeting-1',
      },
      {
        id: 2,
        Title: 'Meeting 2',
        MeetingStart: new Date(),
        MeetingEnd: new Date(),
        Group: ['Group B'],
        HasRegistered: false,
        IsCurrent: true,
        MeetingLink: 'https://example.com/meeting-2',
      },
    ];
  /*upcomingMeetings = [
    {
      id: 1,
      Title: 'Meeting 1',
      MeetingStart: new Date(),
      MeetingEnd: new Date(),
      Group: ['Group A'],
      HasRegistered: true,
      IsUpcoming: true,
      MeetingLink: 'https://example.com/meeting-1',
    },
    {
      id: 2,
      Title: 'Meeting 2',
      MeetingStart: new Date(),
      MeetingEnd: new Date(),
      Group: ['Group B'],
      HasRegistered: false,
      IsUpcoming: true,
      MeetingLink: 'https://example.com/meeting-2',
    },
  ];*/

  it('renders meeting list', () => {
    const { getByText } = render(
      <EventList
        tabsValue={1}
        userInfo={userInfo}
        configuration={configuration}
        currentMeetings={meetings}
      />,
    );

    expect(getByText(meetings[0].Title)).toBeInTheDocument();
    expect(getByText(meetings[1].Title)).toBeInTheDocument();
  });

  it('renders correct number of columns', () => {
    const { getAllByRole } = render(
      <EventList
        tabsValue={1}
        userInfo={userInfo}
        configuration={configuration}
        currentMeetings={meetings}
      />,
    );
    expect(getAllByRole('columnheader')).toHaveLength(3);
  });

  /*
    it('calls register event function when clicking register button', () => {
        const onRegisterEvent = jest.fn();
        const { getByText } = render(
            <EventList
                tabsValue={0}
                userInfo={userInfo}
                configuration={configuration}
                upcomingMeetings={upcomingMeetings}
                onRegisterEvent={onRegisterEvent}
            />,
        );
        fireEvent.click(getByText('Register'));
        expect(onRegisterEvent).toHaveBeenCalledTimes(1);
    });

    it('calls approve event function when clicking approval button', () => {
        const onApproveEvent = jest.fn();
        const { getByText } = render(
            <EventList
                tabsValue={0}
                userInfo={userInfo}
                configuration={configuration}
                upcomingMeetings={upcomingMeetings}
                onApproveEvent={onApproveEvent}
            />,
        );
        fireEvent.click(getByText('Approve'));
        expect(onApproveEvent).toHaveBeenCalledTimes(1);
    });

    it('calls join event function when clicking join button', () => {
        const onJoinEvent = jest.fn();
        const { getByText } = render(
            <EventList
                userInfo={userInfo}
                configuration={configuration}
                meetings={meetings}
                onJoinEvent={onJoinEvent}
            />,
        );
        fireEvent.click(getByText('Join'));
        expect(onJoinEvent).toHaveBeenCalledTimes(1);
    });

    it('renders rating column when user is Eionet user', () => {
        const meetingsWithRatingColumn = [...meetings];
        meetingsWithRatingColumn[0].AllowVote = true;
        const { getByText } = render(
            <EventList
                userInfo={userInfo}
                configuration={configuration}
                meetings={meetingsWithRatingColumn}
            />,
        );
        expect(getByText('Rate')).toBeInTheDocument();
    });

    it('does not render rating column when user is not Eionet user', () => {
        const meetingsWithoutRatingColumn = [...meetings];
        meetingsWithoutRatingColumn[0].AllowVote = false;
        const { queryByText } = render(
            <EventList
                userInfo={userInfo}
                configuration={configuration}
                meetings={meetingsWithoutRatingColumn}
            />,
        );
        expect(queryByText('Rate')).not.toBeInTheDocument();
    });*/
});
