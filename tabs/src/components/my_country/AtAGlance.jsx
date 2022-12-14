import { React } from 'react';
import { Box } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';

export function AtAGlance({ meetings, consultations, users, country }) {
  const signedInUsersCount = users.filter((u) => {
      return u.SignedIn;
    }).length,
    organisations = [...new Set(users.map((u) => u.OrganisationLookupId))];
  return (
    <div className="">
      <Box
        sx={{
          boxShadow: 2,
          height: '80%',
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
            valueText={organisations.length}
            textColor="orange"
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={users.length - signedInUsersCount}
            textColor="blue"
          ></IndicatorCard>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
          <CountryProgress
            meetings={meetings}
            consultations={consultations}
            country={country}
          ></CountryProgress>
        </Box>
      </Box>
    </div>
  );
}
