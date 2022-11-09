import { React, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { Box, Typography, Tabs, Tab, Link, Button } from '@mui/material';
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

export function EventList({ configuration, meetings }) {
  const currentMeetings = meetings.filter((c) => {
      return c.MeetingStart <= new Date() && c.MeetingEnd >= new Date();
    }),
    upcomingMeetings = meetings.filter((c) => {
      return c.MeetingStart > new Date();
    }),
    pastMeetings = meetings.filter((c) => {
      return c.MeetingEnd < new Date();
    });

  const renderMeetingTitle = (params) => {
      return (
        <Link
          component="button"
          variant="body1"
          onClick={() => {
            params.row.MeetingLink && window.open(params.row.MeetingLink.Url, '_blank');
          }}
        >
          {params.row.Title}
        </Link>
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
    };

  const columns = [
    {
      field: 'Title',
      headerName: 'Event',
      flex: 1.5,
      headerClassName: 'grid-header',
      renderCell: renderMeetingTitle,
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
              columns={columns}
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
              columns={columns}
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
              columns={columns}
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
