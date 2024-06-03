import React, { useState } from 'react';

import {
  Box,
  CircularProgress,
  Typography,
  Link,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  Badge,
} from '@mui/material';

import { format } from 'date-fns';
import DoneIcon from '@mui/icons-material/Done';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReviewsIcon from '@mui/icons-material/Reviews';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import { ReactComponent as TeamsIcon } from '../../static/images/teams-icon.svg';
import { GroupsTags } from './GroupsTags';
import ResizableGrid from '../ResizableGrid';
import { EventRegistration } from '../event_registration/EventRegistration';
import { getCurrentParticipant } from '../../data/sharepointProvider';

import { EventDialogTitle } from '../EventDialogTitle';

export function EventList({
  userInfo,
  configuration,
  pastMeetings,
  currentMeetings,
  upcomingMeetings,
  tabsValue,
  openRating,
  openApproval,
}) {
  const [tagsCellOpen, setTagCellOpen] = useState(false),
    [participant, setParticipant] = useState({}),
    [selectedEvent, setSelectedEvent] = useState({}),
    [selectedGroups, setSelectedGroups] = useState([]),
    [registrationVisible, setRegistrationVisible] = useState(false),
    [loading, setLoading] = useState(false);

  const handleRegistrationClose = () => {
    setRegistrationVisible(false);
  };

  const processParticipants = async (event) => {
    const participant = await getCurrentParticipant(event, userInfo);

    setSelectedEvent(event);
    setParticipant(participant);
  };

  const renderCountCell = (params) => {
      const row = params.row;
      return (
        <div>
          {row.IsPast && row.NoOfParticipants > 0 && (
            <Tooltip title={configuration.NoOfParticipantsTooltip}>
              <Box className="grid-cell">
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    params.row.ParticipantsUrl && window.open(params.row.ParticipantsUrl, '_blank');
                  }}
                >
                  {params.row.NoOfParticipants}
                </Link>
              </Box>
            </Tooltip>
          )}
          {(row.IsUpcoming || row.IsCurrent) && row.NoOfRegistered > 0 && (
            <Tooltip title={configuration.NoOfRegisteredTooltip}>
              <Box className="grid-cell">
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => {
                    params.row.RegisteredUrl && window.open(params.row.RegisteredUrl, '_blank');
                  }}
                >
                  {params.row.NoOfRegistered}
                </Link>
              </Box>
            </Tooltip>
          )}
        </div>
      );
    },
    renderMeetingTitle = (params) => {
      return (
        <Tooltip title={params.row.Title}>
          <Box className="grid-cell">
            {params.row.Linktofolder && (
              <Link
                className="grid-text"
                component="button"
                variant="body1"
                onClick={() => {
                  params.row.Linktofolder && window.open(params.row.Linktofolder, '_blank');
                }}
              >
                {params.row.Title}
              </Link>
            )}
            {!params.row.Linktofolder && (
              <Typography className="grid-text" variant="body1" component={'span'}>
                {params.row.Title}
              </Typography>
            )}
          </Box>
        </Tooltip>
      );
    },
    renderMeetingStart = (params) => {
      let dateFormat = params.row.IsPast ? configuration.DateFormatDashboard : longDateFormat;
      return (
        <Typography
          sx={{ whiteSpace: 'pre-line' }}
          className="grid-text"
          variant="body1"
          component={'span'}
        >
          {format(params.row.MeetingStart, dateFormat)}
        </Typography>
      );
    },
    renderMeetingEnd = (params) => {
      let dateFormat = params.row.IsPast ? configuration.DateFormatDashboard : longDateFormat;
      return (
        <Typography
          sx={{ whiteSpace: 'pre-line' }}
          className="grid-text"
          variant="body1"
          component={'span'}
        >
          {params.row.MeetingEnd && format(params.row.MeetingEnd, dateFormat)}
        </Typography>
      );
    },
    renderRegisterUrl = (params) => {
      const event = params.row;
      return (
        <Tooltip title={configuration.RegisterEventButtonTooltip}>
          <IconButton
            variant="contained"
            color={event.HasRegistered ? 'secondary' : 'primary'}
            onClick={async () => {
              setLoading(true);
              await processParticipants(event);
              setRegistrationVisible(true);
              setLoading(false);
            }}
          >
            {event.HasRegistered && <DoneIcon />}
            {!event.HasRegistered && <OpenInNewIcon />}
          </IconButton>
        </Tooltip>
      );
    },
    renderApproval = (params) => {
      const event = params.row,
        participantsCount = event.Participants ? event.Participants.length : 0,
        pendingApprovalCount =
          participantsCount > 0
            ? event.Participants.filter((p) => !p.NFPApproved || p.NFPApproved == 'No value').length
            : 0;
      return (
        <div>
          {event.IsOffline && participantsCount > 0 && (
            <Tooltip title={configuration.RegisterEventButtonTooltip}>
              <Badge badgeContent={pendingApprovalCount} color="secondary" overlap="circular">
                <IconButton
                  variant="contained"
                  color="primary"
                  onClick={async () => {
                    openApproval(event);
                  }}
                >
                  <FactCheckOutlinedIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          )}
        </div>
      );
    },
    renderJoinUrl = (params) => {
      return (
        <div>
          {params.row.MeetingLink && (
            <Tooltip title={configuration.JoinEventButtonTooltip}>
              <IconButton
                variant="contained"
                color="success"
                onClick={() => {
                  params.row.MeetingLink && window.open(params.row.MeetingLink, '_blank');
                }}
              >
                <TeamsIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    },
    renderGroupsTags = (params) => {
      return <GroupsTags handleClick={handleCellClick} groups={params.row.Group || []} />;
    },
    renderRating = (params) => {
      const event = params.row;
      return (
        <div>
          {!!event.AllowVote && (
            <IconButton
              variant="contained"
              color="primary"
              onClick={async () => {
                openRating(event);
              }}
            >
              <ReviewsIcon />
            </IconButton>
          )}
          {!!event.HasVoted && (
            <IconButton variant="contained" color="primary">
              <TaskAltIcon />
            </IconButton>
          )}
        </div>
      );
    };

  const handleCellClick = (groups) => {
      setTagCellOpen(true);
      setSelectedGroups(groups);
    },
    handleTagDialogClose = () => {
      setTagCellOpen(false);
    };

  const baseColumns = [
    {
      field: 'Title',
      headerName: 'Event',
      flex: 1,

      renderCell: renderMeetingTitle,
    },
    {
      field: 'Group',
      headerName: 'Eionet groups',

      renderCell: renderGroupsTags,
      flex: 0.5,
    },
    {
      field: 'MeetingStart',
      headerName: 'Start date',
      width: '130',

      renderCell: renderMeetingStart,
    },
    {
      field: 'MeetingEnd',
      headerName: 'End date',
      width: '130',
      renderCell: renderMeetingEnd,
    },
  ];
  const participantsColumn = {
      field: 'NoOfParticipants',
      headerName: 'Participants',
      align: 'center',
      width: '100',
      renderCell: renderCountCell,
    },
    registrationsColumn = {
      field: 'NoOfRegistered',
      headerName: 'Enrolled',
      align: 'center',
      width: '100',
      renderCell: renderCountCell,
    },
    approvalColumn = {
      field: 'Approval',
      headerName: 'Approval',
      align: 'center',
      width: '100',
      renderCell: renderApproval,
    },
    ratingColumn = {
      field: 'AllowVote',
      headerName: 'Rate',
      description: configuration.RatingColumnHeaderDescription,
      align: 'center',
      width: '100',
      renderCell: renderRating,
    },
    currentColumns = Array.from(baseColumns);

  currentColumns.push({
    field: 'MeetingLink',
    headerName: 'Join',
    align: 'center',
    width: '60',
    renderCell: renderJoinUrl,
  });
  currentColumns.splice(2, 0, registrationsColumn);
  userInfo.country && userInfo.isEionetUser && currentColumns.splice(2, 0, ratingColumn);

  let upcomingColumns = Array.from(baseColumns);
  //do not show register column if user is missing the country info.
  userInfo.country &&
    upcomingColumns.push({
      field: 'MeetingRegistrationLink',
      headerName: 'Register',
      align: 'center',
      width: '75',
      renderCell: renderRegisterUrl,
    });
  upcomingColumns.splice(2, 0, registrationsColumn);
  userInfo.isNFP && upcomingColumns.push(approvalColumn);

  let pastColumns = Array.from(baseColumns);
  pastColumns.splice(2, 0, participantsColumn);
  userInfo.country && userInfo.isEionetUser && pastColumns.splice(2, 0, ratingColumn);

  const longDateFormat = configuration.DateFormatDashboard + '\n HH:mm';

  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Dialog open={tagsCellOpen} onClose={handleTagDialogClose}>
          <GroupsTags groups={selectedGroups} isDialog={true} />
          <Button
            onClick={handleTagDialogClose}
            sx={{ alignSelf: 'end', marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Close
          </Button>
        </Dialog>
        <Dialog
          className="dialog"
          open={registrationVisible}
          onClose={handleRegistrationClose}
          maxWidth="lg"
          fullWidth
        >
          {selectedEvent.Title && (
            <DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleRegistrationClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <EventDialogTitle
                title={'EVENT REGISTRATION'}
                event={selectedEvent}
              ></EventDialogTitle>
            </DialogTitle>
          )}
          <EventRegistration
            event={selectedEvent}
            userInfo={userInfo}
            participant={participant}
          ></EventRegistration>
        </Dialog>

        <Box className="grid-container">
          {tabsValue == 0 && (
            <ResizableGrid
              rows={upcomingMeetings}
              columns={upcomingColumns}
              hideFooterSelectedRowCount
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'MeetingStart',
                      sort: 'asc',
                    },
                  ],
                },
              }}
            />
          )}
          {tabsValue == 1 && (
            <ResizableGrid
              rows={currentMeetings}
              columns={currentColumns}
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'MeetingStart',
                      sort: 'asc',
                    },
                  ],
                },
              }}
              hideFooterSelectedRowCount
            />
          )}
          {tabsValue == 2 && (
            <ResizableGrid
              rows={pastMeetings}
              columns={pastColumns}
              hideFooterSelectedRowCount
              pageSizeOptions={[25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 25 } },
                sorting: {
                  sortModel: [
                    {
                      field: 'MeetingStart',
                      sort: 'desc',
                    },
                  ],
                },
              }}
            />
          )}
        </Box>
        {loading && (
          <CircularProgress
            color="primary"
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </div>
  );
}
