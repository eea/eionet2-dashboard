import { React, useState } from 'react';
import { Box, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { GroupView } from './GroupView';
import CustomDrawer from '../CustomDrawer';

export function GroupsBoard({ users, mappings }) {
  const [groupIndex, setGroupIndex] = useState(0),
    groups = mappings.map((m) => {
      const filteredUsers = users.filter((user) => {
        return user.AllMemberships.includes(m.Membership);
      });
      return {
        GroupName: m.Membership,
        Users: filteredUsers,
      };
    }).filter((group) => group.Users.length > 0),
    drawerOptions = (
      <div>
        {groups.map((currentGroup, index) => {
          return (
            <ListItem disablePadding className="list-item" key={index}>
              <ListItemButton
                className={'list-item-button ' + (groupIndex == index ? ' drawer-item-selected' : '')}
                onClick={() => setGroupIndex(index)}
              >
                <ListItemText primary={currentGroup.GroupName} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </div >);

  return (
    <Box sx={{ overflowY: 'scroll', display: 'flex', width: '100%', height: '98%', background: 'white', }}>
      <CustomDrawer drawerOptions={drawerOptions}></CustomDrawer>
      <GroupView group={groups[groupIndex]} ></GroupView>
    </Box>
  );
}
