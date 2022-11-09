import { React } from 'react';
import { Box } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';

export function AtAGlance({ users }) {
  const signedInUsersCount = users.filter((u) => {
    return u.SignedIn;
  }).length;
  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Box sx={{ display: 'flex', textAlign: 'center' }}>
          <IndicatorCard
            labelText="Users signed in"
            valueText={signedInUsersCount}
            textColor="lightgreen"
          ></IndicatorCard>
          <IndicatorCard
            labelText="Users pending sign in"
            valueText={users.length - signedInUsersCount}
            textColor="#F5E216"
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with nominations"
            valueText={users.length - signedInUsersCount}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Organisations"
            valueText={users.length - signedInUsersCount}
            textColor="orange"
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={users.length - signedInUsersCount}
            textColor="blue"
          ></IndicatorCard>
        </Box>
      </Box>
    </div>
  );
}
