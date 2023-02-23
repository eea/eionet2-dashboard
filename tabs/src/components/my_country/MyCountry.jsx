import { React, useState, useEffect } from 'react';
import { Backdrop, Box, CircularProgress, Tabs, Tab } from '@mui/material';
import { AtAGlance } from './AtAGlance';
import { ManagementBoard } from './ManagementBoard';
import {
  getMappingsList,
  getInvitedUsers,
  getMeetings,
  getConsultations,
  getOrganisationList,
  getAvailableGroups,
} from '../../data/sharepointProvider';
import { GroupsBoard } from './GroupsBoard';
import './my_country.scss';
import { getConfiguration } from '../../data/apiProvider';
import { ScientificCommittee } from './ScientificCommittee';
import { DataReporters } from './DataReporters';
import TabPanel from '../TabPanel';
import { a11yProps } from '../../utils/uiHelper';

export function MyCountry({ userInfo, selectedCountry }) {
  const [tabsValue, setTabsValue] = useState(0),
    [users, setUsers] = useState([]),
    [mappings, setMappings] = useState([]),
    [loading, setloading] = useState(false),
    [consultations, setConsultations] = useState([]),
    [organisations, setOrganisations] = useState([]),
    [availableGroups, setAvailableGroups] = useState([]),
    [meetings, setMeetings] = useState([]),
    [configuration, setConfiguration] = useState({});

  const handleChange = (_event, newValue) => {
      setTabsValue(newValue);
    },
    loadData = async (country) => {
      setloading(true);
      const loadedUsers = await getInvitedUsers(country),
        loadedOrganisations = await getOrganisationList(country),
        loadedGroups = await getAvailableGroups();
      loadedOrganisations && setOrganisations(loadedOrganisations);
      setUsers(loadedUsers);
      setAvailableGroups(loadedGroups);
      setloading(false);
    };

  useEffect(() => {
    (async () => {
      setloading(true);

      const loadedConfiguration = await getConfiguration();
      if (loadedConfiguration) {
        setConfiguration(loadedConfiguration);
      }

      await loadData(selectedCountry);

      //get meetings from last four years
      const fromDate = new Date(new Date().getFullYear() - 4, 0, 1);
      let loadedMeetings = await getMeetings(fromDate, selectedCountry),
        loadedConsultations = await getConsultations(undefined, fromDate);

      loadedMeetings && setMeetings(loadedMeetings);
      loadedConsultations && setConsultations(loadedConsultations);

      let loadedMappings = await getMappingsList();
      if (loadedMappings) {
        setMappings(loadedMappings);
      }

      setloading(false);
    })();
  }, [selectedCountry]);

  return (
    <div className="">
      <Box sx={{ overflowY: 'scroll' }}>
        <Backdrop
          sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        <Tabs value={tabsValue} onChange={handleChange}>
          <Tab label="At a glance" {...a11yProps(0)} />
          <Tab label="NFPs/MB" {...a11yProps(1)} />
          <Tab label="Eionet groups" {...a11yProps(2)} />
          <Tab label="ETCs" {...a11yProps(3)} />
        </Tabs>

        <TabPanel value={tabsValue} index={0}>
          <AtAGlance
            meetings={meetings}
            consultations={consultations}
            users={users}
            country={selectedCountry}
            configuration={configuration}
            userInfo={userInfo}
            organisations={organisations}
            availableGroups={availableGroups}
          ></AtAGlance>
        </TabPanel>
        <TabPanel value={tabsValue} index={1}>
          <ManagementBoard users={users} mappings={mappings}></ManagementBoard>
        </TabPanel>
        <TabPanel value={tabsValue} index={2}>
          <GroupsBoard
            users={users}
            mappings={mappings.filter((m) => {
              return !m.OtherMembership;
            })}
          ></GroupsBoard>
        </TabPanel>
        <TabPanel value={tabsValue} index={3}>
          <GroupsBoard
            users={users}
            mappings={mappings.filter((m) => {
              return m.OtherMembership;
            })}
          ></GroupsBoard>
        </TabPanel>
        {false && (
          <TabPanel value={tabsValue} index={4}>
            <ScientificCommittee></ScientificCommittee>
          </TabPanel>
        )}
        {false && (
          <TabPanel value={tabsValue} index={5}>
            <DataReporters></DataReporters>
          </TabPanel>
        )}
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
