import { React, useState, useEffect, useCallback } from 'react';
import { Backdrop, CircularProgress, Box, Tabs, Tab } from '@mui/material';
import { ConsultationList } from './ConsultationList';
import { EventList } from './EventList';
import { getConsultations, getMeetings } from '../../data/sharepointProvider';
import { getConfiguration } from '../../data/apiProvider';
import { Reporting } from './Reporting';
import TabPanel from '../TabPanel';
import { a11yProps } from '../../utils/uiHelper';

export function Activity({ userInfo }) {
  const [tabsValue, setTabsValue] = useState(0),
    [consultations, setConsultations] = useState([]),
    [surveys, setSurveys] = useState([]),
    [configuration, setConfiguration] = useState({}),
    [meetings, setMeetings] = useState([]),
    [loading, setloading] = useState(false);

  const handleChange = useCallback(
    (_event, newValue) => {
      setTabsValue(newValue);
    },
    [setTabsValue],
  );

  useEffect(() => {
    (async () => {
      setloading(true);
      let loadedConfiguration = await getConfiguration();
      if (loadedConfiguration) {
        setConfiguration(loadedConfiguration);
      }

      //get meetings back one year from today
      let loadedMeetings = await getMeetings(
          new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
          userInfo.country,
        ),
        loadedConsultations = await getConsultations(undefined, undefined, userInfo.country);

      loadedMeetings && setMeetings(loadedMeetings);
      loadedConsultations &&
        setConsultations(loadedConsultations.filter((c) => c.ConsultationType == 'Consultation'));
      loadedConsultations &&
        setSurveys(loadedConsultations.filter((c) => c.ConsultationType == 'Inquiry'));

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
          <Tab label="Inquiries" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={tabsValue} index={0}>
          <EventList
            configuration={configuration}
            meetings={meetings}
            country={userInfo.country}
          ></EventList>
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
            type={'Inquiry'}
          ></ConsultationList>
        </TabPanel>
        <TabPanel value={tabsValue} index={3}>
          <Reporting></Reporting>
        </TabPanel>
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
