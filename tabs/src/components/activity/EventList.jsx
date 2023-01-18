import { React, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { Box, Typography, Tabs, Tab, Link, Button, Tooltip, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { format } from 'date-fns';
import './activity.css';

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

export function EventList({ configuration, meetings, country }) {
  const currentMeetings = meetings.filter((c) => {
    return c.IsCurrent;
  }),
    upcomingMeetings = meetings.filter((c) => {
      return c.IsUpcoming;
    }),
    pastMeetings = meetings.filter((c) => {
      return c.IsPast;
    });

  const renderMeetingTitle = (params) => {
    return (
      <Box className='grid-cell'>
        {params.row.Linktofolder && (
          <Link
            component="button"
            variant="body1"
            onClick={() => {
              params.row.Linktofolder && window.open(params.row.Linktofolder.Url, '_blank');
            }}
          >
            {params.row.Title}
          </Link>
        )}
        {!params.row.Linktofolder && (
          <Typography variant="body1" component={'span'}>
            {params.row.Title}
          </Typography>
        )}
        {params.row.IsPast && params.row.NoOfParticipants > 0 &&
          <Box className='grid-cell'>
            <PersonIcon></PersonIcon>
            <Typography variant="body1" component={'span'}>
              {country} ({params.row.NoOfParticipants})
            </Typography>
          </Box>}
        {params.row.IsUpcoming && params.row.NoOfRegistered > 0 &&
          <Box className='grid-cell'>
            <PersonIcon></PersonIcon>
            <Typography variant="body1" component={'span'}>
              {country} ({params.row.NoOfRegistered})
            </Typography>
          </Box>}
      </Box>
    );
  },
    renderMeetingStart = (params) => {
      let dateFormat = configuration.DateFormatDashboard;
      return (
        <Typography variant="body1" component={'span'}>
          {format(params.row.MeetingStart, dateFormat)}
        </Typography>
      );
    },
    renderMeetingEnd = (params) => {
      let dateFormat = configuration.DateFormatDashboard;
      return (
        <Typography variant="body1" component={'span'}>
          {params.row.MeetingEnd && format(params.row.MeetingEnd, dateFormat)}
        </Typography>
      );
    },
    renderJoinLink = (params) => {
      if (params.row.MeetingLink) {
        return (
          <Button
            variant="contained"
            color="success"
            onClick={() => {
              params.row.MeetingLink && window.open(params.row.MeetingLink.Url, '_blank');
            }}
          >
            {params.row.MeetingLink.Description || 'Join Online'}
          </Button>
        );
      }
    },
    renderRegisterLink = (params) => {
      if (params.row.MeetingRegistrationLink) {
        return (
          <Button variant="contained" color="success" onClick={() => {
            params.row.MeetingRegistrationLink && window.open(params.row.MeetingRegistrationLink.Url, '_blank');
          }}>
            {params.row.MeetingRegistrationLink.Description || 'Register'}
          </Button>
        );
      }
    }, renderGroupsTags = (params) => {
      return (
        <Tooltip title={params.row.Group} arrow>
          <div id="test">
            <Chip label={params.row.Group} />
          </div>
        </Tooltip>
      );
    };

  const baseColumns = [
    {
      field: 'Title',
      headerName: 'Event',
      flex: 1.5,
      headerClassName: 'grid-header',
      renderCell: renderMeetingTitle,
    },
    {
      field: 'Group',
      headerName: 'Eionet groups',
      headerClassName: 'grid-header',
      renderCell: renderGroupsTags,
      flex: 1,
    },
    {
      field: 'MeetingStart',
      headerName: 'Start date',
      flex: 0.75,
      headerClassName: 'grid-header',
      renderCell: renderMeetingStart,
    },
    {
      field: 'MeetingEnd',
      headerName: 'End date',
      flex: 0.75,
      headerClassName: 'grid-header',
      renderCell: renderMeetingEnd,
    },
  ];
  let currentColumns = Array.from(baseColumns);
  currentColumns.push({
    field: 'MeetingRegistrationLink',
    headerName: 'Registration',
    flex: 0.75,
    headerClassName: 'grid-header',
    renderCell: renderRegisterLink,
  });
  currentColumns.push({
    field: 'MeetingLink',
    headerName: 'Join',
    flex: 0.75,
    headerClassName: 'grid-header',
    renderCell: renderJoinLink,
  });

  let upcomingColumns = Array.from(baseColumns);
  upcomingColumns.push({
    field: 'MeetingRegistrationLink',
    headerName: 'Registration',
    flex: 0.75,
    headerClassName: 'grid-header',
    renderCell: renderRegisterLink,
  });

  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Box sx={{ display: 'flex', height: '85%', width: '100%' }}>
          <Tabs value={tabsValue} onChange={handleChange} orientation="vertical">
            <Tab label={'Current(' + currentMeetings.length + ')'} {...a11yProps(0)} />
            <Tab label={'Upcoming(' + upcomingMeetings.length + ')'} {...a11yProps(1)} />
            <Tab label={'Past(' + pastMeetings.length + ')'} {...a11yProps(2)} />
          </Tabs>

          <TabPanel className="tab-panel" value={tabsValue} index={0}>
            <DataGrid
              rows={currentMeetings}
              columns={currentColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={1}>
            <DataGrid
              rows={upcomingMeetings}
              columns={upcomingColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel className="tab-panel" value={tabsValue} index={2}>
            <DataGrid
              rows={pastMeetings}
              columns={baseColumns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
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
