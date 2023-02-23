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
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {groups.map((group) => {
          return (
            group.Users.length > 0 && (
              <div className="group-accordion" key={group.GroupName}>
                <GroupAccordion groupName={group.GroupName} users={group.Users}></GroupAccordion>
              </div>
            )
          );
        })}
      </Box>
    </div>
  );
}
