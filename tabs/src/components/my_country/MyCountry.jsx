import { React, useState, useEffect } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import { AtAGlance } from './AtAGlance';
import { ManagementBoard } from './ManagementBoard';
import {
  getMappingsList,
  getInvitedUsers,
  getOrganisationList,
  getAvailableGroups,
  getCountryCodeMappingsList,
} from '../../data/sharepointProvider';
import { GroupsBoard } from './GroupsBoard';
import './my_country.scss';
import { ScientificCommittee } from './ScientificCommittee';
import { DataReporters } from './DataReporters';
import TabPanel from '../TabPanel';

import PreviewIcon from '@mui/icons-material/Preview';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CustomDrawer from '../CustomDrawer';
import { CountryMembers } from './CountryMembers';

export function MyCountry({ userInfo, selectedCountry, configuration, drawerOpen }) {
  const [tabsValue, setTabsValue] = useState(0),
    [users, setUsers] = useState([]),
    [mappings, setMappings] = useState([]),
    [loading, setloading] = useState(false),
    [organisations, setOrganisations] = useState([]),
    [selectedCountryInfo, setSelectedCountryInfo] = useState({}),
    [availableGroups, setAvailableGroups] = useState([]);

  const loadData = (country) => {
    setloading(true);

    getInvitedUsers(country)
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        setloading(false);
      })
      .catch((e) => {
        setloading(false);
        console.log(e.message);
      });
    getOrganisationList(country).then((loadedOrganisations) => {
      loadedOrganisations && setOrganisations(loadedOrganisations);
    });
    getAvailableGroups().then((loadedGroups) => {
      setAvailableGroups(loadedGroups);
    });
    getCountryCodeMappingsList().then((loadedCountries) => {
      selectedCountry &&
        setSelectedCountryInfo(loadedCountries.find((c) => c.CountryCode == selectedCountry));
    });
  };

  useEffect(() => {
    (async () => {
      setloading(true);

      loadData(selectedCountry);

      let loadedMappings = await getMappingsList();
      if (loadedMappings) {
        setMappings(loadedMappings);
      }

      setloading(false);
    })();
  }, [selectedCountry]);

  const drawerOptions = (
    <div>
      {' '}
      <ListItem disablePadding className="list-item" key={1}>
        <ListItemButton
          className={'list-item-button' + (tabsValue == 0 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(0)}
        >
          <ListItemIcon className="list-item-icon">
            <PreviewIcon />
          </ListItemIcon>
          <ListItemText primary={'At a glance'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={2}>
        <ListItemButton
          className={'list-item-button' + (tabsValue == 1 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(1)}
        >
          <ListItemIcon className="list-item-icon">
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary={'MB and NFPs'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={3}>
        <ListItemButton
          className={'list-item-button' + (tabsValue == 2 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(2)}
        >
          <ListItemIcon className="list-item-icon">
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary={'Eionet groups'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={4}>
        <ListItemButton
          className={'list-item-button' + (tabsValue == 3 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(3)}
        >
          <ListItemIcon className="list-item-icon">
            <GroupWorkIcon />
          </ListItemIcon>
          <ListItemText primary={'ETCs'} />
        </ListItemButton>
      </ListItem>
      {selectedCountry && (
        <ListItem disablePadding className="list-item" key={5}>
          <ListItemButton
            className={'list-item-button' + (tabsValue == 4 ? ' drawer-item-selected' : '')}
            onClick={() => setTabsValue(4)}
          >
            <ListItemIcon className="list-item-icon">
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText primary={'Country desk officers'} />
          </ListItemButton>
        </ListItem>
      )}
    </div>
  );

  return (
    <Box
      sx={{
        overflowY: 'hidden',
        display: 'flex',
        height: '100%',
        background: '#F9F9F9',
      }}
    >
      <Backdrop
        sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="primary" />
      </Backdrop>

      {drawerOpen && <CustomDrawer drawerOptions={drawerOptions}> </CustomDrawer>}
      <Box sx={{ width: '100%' }}>
        <TabPanel value={tabsValue} index={0}>
          <AtAGlance
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
        {selectedCountry && (
          <TabPanel value={tabsValue} index={4}>
            <CountryMembers countryInfo={selectedCountryInfo}></CountryMembers>
          </TabPanel>
        )}
        {false && (
          <TabPanel value={tabsValue} index={5}>
            <ScientificCommittee></ScientificCommittee>
          </TabPanel>
        )}
        {false && (
          <TabPanel value={tabsValue} index={6}>
            <DataReporters></DataReporters>
          </TabPanel>
        )}
      </Box>
    </Box>
  );
}
