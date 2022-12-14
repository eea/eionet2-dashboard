import { React } from 'react';
import { Box } from '@mui/material';
import { GroupAccordion } from './GroupAccordion';

export function GroupsBoard({ users, mappings }) {
  const groups = mappings.map((m) => {
    const filteredUsers = users.filter((user) => {
      return user.AllMemberships.includes(m.Membership);
    });
    return {
      GroupName: m.Membership,
      Users: filteredUsers,
    };
  });

  return (
    <div className="">
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '80%' }}>
        {groups.map((group) => {
          return (
            <div className="group-accordion" key={group.GroupName}>
              {group.Users.length > 0 && (
                <GroupAccordion groupName={group.GroupName} users={group.Users}></GroupAccordion>
              )}
            </div>
          );
        })}
      </Box>
    </div>
  );
}
