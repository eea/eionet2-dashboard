import React, { useState } from 'react';
import { Box, ListItem, ListItemButton, ListItemText, IconButton } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { useMediaQuery } from 'react-responsive';

import { GroupView } from './GroupView';
import CustomDrawer from '../CustomDrawer';

export function GroupsBoard({ users, mappings }) {
  const isMobile = useMediaQuery({ query: `(max-width: 768px)` });
  const [drawerOpen, setDraweOpen] = useState(!isMobile),
    [groupIndex, setGroupIndex] = useState(0),
    groups = mappings
      .map((m) => {
        const filteredUsers = users.filter((user) => {
          return user.AllMemberships.includes(m.Membership);
        });
        return {
          GroupName: m.Membership,
          OfficialGroupName: m.OfficialGroupName,
          ETCManagerIds: m.ETCManagers
            ? m.ETCManagers.map((manager) => {
                return manager.LookupId;
              })
            : [],
          EEAGroupLeadsIds: m.EEAGroupLeads
            ? m.EEAGroupLeads.map((lead) => {
                return lead.LookupId;
              })
            : [],
          OtherMembership: m.OtherMembership,
          Users: filteredUsers,
        };
      })
      .filter((group) => group.Users.length > 0)
      .sort((a, b) => a.GroupName.localeCompare(b.GroupName)),
    drawerOptions = (
      <div>
        {groups.map((currentGroup, index) => {
          return (
            <ListItem disablePadding className="list-item" key={index}>
              <ListItemButton
                className={
                  'list-item-button ' + (groupIndex == index ? ' drawer-item-selected' : '')
                }
                onClick={() => setGroupIndex(index)}
              >
                <ListItemText primary={currentGroup.GroupName} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </div>
    );

  const handleDrawerOpen = () => {
    setDraweOpen(!drawerOpen);
  };

  return (
    <Box
      sx={{
        overflowY: 'scroll',
        display: 'flex',
        width: '100%',
        height: '98%',
        background: 'white',
      }}
    >
      <Box sx={{ display: 'flex' }}>
        {isMobile && (
          <IconButton sx={{ alignSelf: 'flex-start' }} onClick={handleDrawerOpen}>
            {!drawerOpen && <MenuIcon />}
            {drawerOpen && <ChevronLeftIcon />}
          </IconButton>
        )}
        {drawerOpen && <CustomDrawer drawerOptions={drawerOptions}></CustomDrawer>}
      </Box>
      <GroupView group={groups[groupIndex]}></GroupView>
    </Box>
  );
}
