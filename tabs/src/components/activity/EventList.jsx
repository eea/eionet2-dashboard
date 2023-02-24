import { React, useCallback, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Link,
  Button,
  Tooltip,
  IconButton,
  Dialog,
} from '@mui/material';
import { format } from 'date-fns';
import './activity.scss';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { ReactComponent as TeamsIcon } from '../../static/images/teams-icon.svg';
import { GroupsTags } from './GroupsTags';
import ResizableGrid from '../ResizableGrid';
import TabPanel from '../TabPanel';
import { a11yProps } from '../../utils/uiHelper';

export function EventList({ configuration, meetings }) {
  const [tagsCellOpen, setTagCellOpen] = useState(false),
    [selectedGroups, setSelectedGroups] = useState([]);

  const currentMeetings = meetings.filter((c) => {
      return c.IsCurrent;
    }),
    upcomingMeetings = meetings.filter((c) => {
      return c.IsUpcoming;
    }),
    pastMeetings = meetings.filter((c) => {
      return c.IsPast;
    });

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
          {row.IsUpcoming && row.NoOfRegistered > 0 && (
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
      let dateFormat = params.row.IsPast
        ? configuration.DateFormatDashboard
        : configuration.DateFormatDashboard + ' HH:mm';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {format(params.row.MeetingStart, dateFormat)}
        </Typography>
      );
    },
    renderMeetingEnd = (params) => {
      let dateFormat = params.row.IsPast
        ? configuration.DateFormatDashboard
        : configuration.DateFormatDashboard + ' HH:mm';
      return (
        <Typography className="grid-text" variant="body1" component={'span'}>
          {params.row.MeetingEnd && format(params.row.MeetingEnd, dateFormat)}
        </Typography>
      );
    },
    registerCellContent = (params) => {
      return (
        <Tooltip title={configuration.RegisterEventButtonTooltip}>
          <IconButton
            variant="contained"
            color="primary"
            onClick={() => {
              params.row.MeetingRegistrationLink &&
                window.open(params.row.MeetingRegistrationLink, '_blank');
            }}
          >
            <HowToRegIcon />
          </IconButton>
        </Tooltip>
      );
    },
    renderJoinRegister = (params) => {
      return (
        <div>
          {params.row.MeetingRegistrationLink && registerCellContent(params)}
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
    renderRegisterLink = (params) => {
      if (params.row.MeetingRegistrationLink) {
        return registerCellContent(params);
      }
    },
    renderGroupsTags = (params) => {
      return <GroupsTags handleClick={handleCellClick} groups={params.row.Group || []} />;
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
      headerName: 'Registrations',
      align: 'center',
      width: '100',

      renderCell: renderCountCell,
    },
    currentColumns = Array.from(baseColumns);

  currentColumns.push({
    field: 'MeetingLink',
    headerName: '',
    align: 'center',
    width: '100',

    renderCell: renderJoinRegister,
  });
  currentColumns.splice(2, 0, registrationsColumn);

  let upcomingColumns = Array.from(baseColumns);
  upcomingColumns.push({
    field: 'MeetingRegistrationLink',
    headerName: 'Register',
    align: 'center',
    width: '75',

    renderCell: renderRegisterLink,
  });
  upcomingColumns.splice(2, 0, registrationsColumn);

  let pastColumns = Array.from(baseColumns);
  pastColumns.splice(2, 0, participantsColumn);

  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = useCallback(
    (_event, newValue) => {
      setTabsValue(newValue);
    },
    [tabsValue],
  );

  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Dialog open={tagsCellOpen} onClose={handleTagDialogClose} maxWidth="xl">
          <GroupsTags groups={selectedGroups} isDialog={true} />
          <Button
            onClick={handleTagDialogClose}
            sx={{ alignSelf: 'end', marginRight: '0.5rem', marginBottom: '0.5rem' }}
          >
            Close
          </Button>
        </Dialog>
        <Box sx={{ display: 'flex', height: '85%', width: '100%' }}>
          <Tabs value={tabsValue} onChange={handleChange} orientation="vertical">
            <Tab label={'Ongoing(' + currentMeetings.length + ')'} {...a11yProps(0)} />
            <Tab label={'Upcoming(' + upcomingMeetings.length + ')'} {...a11yProps(1)} />
            <Tab label={'Past(' + pastMeetings.length + ')'} {...a11yProps(2)} />
          </Tabs>

          <TabPanel className="tab-panel" value={tabsValue} index={0}>
            <ResizableGrid
              rows={currentMeetings}
              columns={currentColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={1}>
            <ResizableGrid
              rows={upcomingMeetings}
              columns={upcomingColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={2}>
            <ResizableGrid
              rows={pastMeetings}
              columns={pastColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              initialState={{
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
          </TabPanel>
        </Box>
        <div className="bottom-panel">
          <Button
            variant="contained"
            onClick={() => {
              window.open(configuration.MeetingListUrl, '_blank');
            }}
          >
            View all meetings
          </Button>
        </div>
      </Box>
    </div>
  );
}
