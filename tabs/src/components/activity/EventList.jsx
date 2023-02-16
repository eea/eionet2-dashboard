import { React, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
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
import Constants from '../../data/constants.json';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import { ReactComponent as TeamsIcon } from '../../static/images/teams-icon.svg';
import { GroupsTags } from './GroupsTags';
import CustomColumnResizeIcon from '../CustomColumnResizeIcon';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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
          )}
          {row.IsUpcoming && row.NoOfRegistered > 0 && (
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
          )}
        </div>
      );
    },
    renderMeetingTitle = (params) => {
      return (
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
        <Tooltip title="Register">
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
            <Tooltip title="Join event">
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
      flex: 1.5,

      renderCell: renderMeetingTitle,
    },
    {
      field: 'Group',
      headerName: 'Eionet groups',

      renderCell: renderGroupsTags,
      flex: 2,
    },
    {
      field: 'MeetingStart',
      headerName: 'Start date',
      width: '100',

      renderCell: renderMeetingStart,
    },
    {
      field: 'MeetingEnd',
      headerName: 'End date',
      width: '100',

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
    currentColumns = Array.from(baseColumns);

  currentColumns.push({
    field: 'MeetingLink',
    headerName: '',
    align: 'center',
    width: '100',

    renderCell: renderJoinRegister,
  });
  currentColumns.splice(2, 0, participantsColumn);

  let upcomingColumns = Array.from(baseColumns);
  upcomingColumns.push({
    field: 'MeetingRegistrationLink',
    headerName: 'Register',
    align: 'center',
    width: '75',

    renderCell: renderRegisterLink,
  });
  upcomingColumns.splice(2, 0, {
    field: 'NoOfRegistered',
    headerName: 'Registered',
    align: 'center',
    width: '85',

    renderCell: renderCountCell,
  });

  let pastColumns = Array.from(baseColumns);
  pastColumns.splice(2, 0, participantsColumn);

  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = (_event, newValue) => {
    setTabsValue(newValue);
  };

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
            <Tab label={'Current(' + currentMeetings.length + ')'} {...a11yProps(0)} />
            <Tab label={'Upcoming(' + upcomingMeetings.length + ')'} {...a11yProps(1)} />
            <Tab label={'Past(' + pastMeetings.length + ')'} {...a11yProps(2)} />
          </Tabs>

          <TabPanel className="tab-panel" value={tabsValue} index={0}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={currentMeetings}
              columns={currentColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={1}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={upcomingMeetings}
              columns={upcomingColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={2}>
            <DataGrid
              components={{
                ColumnResizeIcon: CustomColumnResizeIcon,
              }}
              rows={pastMeetings}
              columns={pastColumns}
              autoPageSize={true}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return Constants.GridRowHeight;
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
