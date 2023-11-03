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
} from '../../data/sharepointProvider';
import { GroupsBoard } from './GroupsBoard';
import './my_country.scss';
import { getConfiguration } from '../../data/apiProvider';
import { ScientificCommittee } from './ScientificCommittee';
import { DataReporters } from './DataReporters';
import TabPanel from '../TabPanel';

import PreviewIcon from '@mui/icons-material/Preview';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import CustomDrawer from '../CustomDrawer';

export function MyCountry({ userInfo, selectedCountry, drawerOpen }) {
  const [tabsValue, setTabsValue] = useState(0),
    [users, setUsers] = useState([]),
    [mappings, setMappings] = useState([]),
    [loading, setloading] = useState(false),
    [organisations, setOrganisations] = useState([]),
    [availableGroups, setAvailableGroups] = useState([]),
    [configuration, setConfiguration] = useState({});

  const loadData = async (country) => {
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
      </Box>
      {false && <span>{userInfo.toString()}</span>}
    </Box>
  );
}
