import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Backdrop, CircularProgress, Box, Tabs, Tab, Typography } from '@mui/material';
import { ConsultationList } from './ConsultationList';
import { EventList } from './EventList';
import { getConsultations, getMeetings } from '../../data/sharepointProvider';
import { getConfiguration } from '../../data/apiProvider';

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
        <Box
          sx={{
            paddingTop: 0.5,
          }}
        >
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

export function Activity({ userInfo }) {
  const [tabsValue, setTabsValue] = useState(0),
    [consultations, setConsultations] = useState([]),
    [surveys, setSurveys] = useState([]),
    [configuration, setConfiguration] = useState({}),
    [meetings, setMeetings] = useState([]),
    [loading, setloading] = useState(false);

  const handleChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  useEffect(() => {
    (async () => {
      setloading(true);
      let configuration = await getConfiguration();
      if (configuration) {
        setConfiguration(configuration);
      }

      let loadedMeetings = await getMeetings(),
        loadedConsultations = await getConsultations();

      loadedMeetings && setMeetings(loadedMeetings);
      loadedConsultations &&
        setConsultations(loadedConsultations.filter((c) => c.ConsultationType == 'Consultation'));
      loadedConsultations &&
        setSurveys(loadedConsultations.filter((c) => c.ConsultationType == 'Survey'));



      setloading(false);
    })();
  }, []);

  return (
    <div className="">
      <Box>
        <Backdrop
          sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Tabs value={tabsValue} onChange={handleChange}>
          <Tab label="Events" {...a11yProps(0)} />
          <Tab label="Consultations" {...a11yProps(1)} />
          <Tab label="Surveys" {...a11yProps(2)} />
          <Tab label="Reporting" {...a11yProps(3)} />
        </Tabs>

        <TabPanel value={tabsValue} index={0}>
          <EventList configuration={configuration} meetings={meetings} country={userInfo.country}></EventList>
        </TabPanel>
        <TabPanel value={tabsValue} index={1}>
          <ConsultationList
            configuration={configuration}
            consultations={consultations}
            type={'Consultation'}
          ></ConsultationList>
        </TabPanel>
        <TabPanel value={tabsValue} index={2}>
          <ConsultationList
            configuration={configuration}
            consultations={surveys}
            type={'Survey'}
          ></ConsultationList>
        </TabPanel>
        <TabPanel value={tabsValue} index={2}></TabPanel>
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
