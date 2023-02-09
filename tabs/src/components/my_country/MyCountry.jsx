import { React, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  Backdrop,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import { AtAGlance } from './AtAGlance';
import { ManagementBoard } from './ManagementBoard';
import {
  getCountries,
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
        <Box sx={{ p: 3 }}>
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

export function MyCountry({ userInfo }) {
  const [tabsValue, setTabsValue] = useState(0),
    [selectedCountry, setSelectedCountry] = useState(''),
    [canChangeCountry, setCanChangeCountry] = useState(false),
    [users, setUsers] = useState([]),
    [mappings, setMappings] = useState([]),
    [countries, setCountries] = useState([]),
    [loading, setloading] = useState(false),
    [consultations, setConsultations] = useState([]),
    [organisations, setOrganisations] = useState([]),
    [availableGroups, setAvailableGroups] = useState([]),
    [meetings, setMeetings] = useState([]),
    [configuration, setConfiguration] = useState({}),
    nonIsoCountryCodes = {
      el: 'gr',
      io: '',
      uk: 'gb',
    };

  const handleChange = (event, newValue) => {
      setTabsValue(newValue);
    },
    loadData = async (country) => {
      setloading(true);
      setSelectedCountry(country);
      const loadedUsers = await getInvitedUsers(country),
        loadedOrganisations = await getOrganisationList(country),
        loadedGroups = await getAvailableGroups();
      loadedOrganisations && setOrganisations(loadedOrganisations);
      setUsers(loadedUsers);
      setAvailableGroups(loadedGroups);
      setloading(false);
    },
    preProcessCountryCode = (code) => {
      return nonIsoCountryCodes[code] ? nonIsoCountryCodes[code] : code;
    };

  useEffect(() => {
    (async () => {
      setloading(true);

      const loadedConfiguration = await getConfiguration();
      if (loadedConfiguration) {
        setConfiguration(loadedConfiguration);
      }

      if (userInfo.isAdmin) {
        setCanChangeCountry(true);
        const loadedCountries = await getCountries();
        loadedCountries && setCountries(loadedCountries);
      }

      await loadData(userInfo.country);

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
  }, []);

  return (
    <div className="">
      <Box sx={{ overflowY: 'scroll' }}>
        <Backdrop
          sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Box
          sx={{
            boxShadow: 2,
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'row',
          }}
        >
          {canChangeCountry && (
            <Autocomplete
              sx={{
                width: '10%',
              }}
              disablePortal
              id="country"
              defaultValue={userInfo.country}
              options={countries}
              onChange={async (_e, value) => {
                await loadData(value);
              }}
              renderOption={(props, option) => (
                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                  <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${preProcessCountryCode(
                      option.toLowerCase(),
                    )}.png`}
                    alt=""
                  />
                  {option}
                </Box>
              )}
              renderInput={(params) => (
                <TextField autoComplete="off" {...params} label="Country" variant="standard" />
              )}
            />
          )}
          {selectedCountry && (
            <img
              className="country-flag"
              loading="lazy"
              height={40}
              src={`https://flagcdn.com/h40/${preProcessCountryCode(
                selectedCountry.toLowerCase(),
              )}.png`}
              alt=""
            />
          )}
        </Box>
        <Tabs value={tabsValue} onChange={handleChange}>
          <Tab label="At a glance" {...a11yProps(0)} />
          <Tab label="NFPs/MB" {...a11yProps(1)} />
          <Tab label="Eionet groups" {...a11yProps(2)} />
          <Tab label="ETCs" {...a11yProps(3)} />
          <Tab label="Scientific committee" {...a11yProps(4)} />
          <Tab label="Data reporters" {...a11yProps(5)} />
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
        <TabPanel value={tabsValue} index={4}>
          <ScientificCommittee></ScientificCommittee>
        </TabPanel>
        <TabPanel value={tabsValue} index={5}>
          <DataReporters></DataReporters>
        </TabPanel>
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
