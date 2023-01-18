import { React } from 'react';
import { Box, Button } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';

export function AtAGlance({ meetings, consultations, users, country, configuration, userInfo }) {
  const signedInUsers = users.filter((u) => {
    return u.SignedIn;
  }),
    signedInGroups = getGroups(signedInUsers),
    pendingSignInUsers = users.filter((u) => {
      return !u.SignedIn;
    }),
    pendingSignInGroups = getGroups(pendingSignInUsers),
    organisations = [...new Set(users.map((u) => u.OrganisationLookupId))],
    allGroups = getGroups(users);
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
            valueText={signedInUsers.length}
            textColor="lightgreen"
            url={configuration.UserListUrl + "?FilterField1=SignedIn&FilterValue1=1" + "&FilterField2=Country&FilterValue2=" + country}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Users pending sign in"
            valueText={users.length - signedInUsers.length}
            textColor="#F5E216"
            url={configuration.UserListUrl + "?FilterField1=SignedIn&FilterValue1=0" + "&FilterField2=Country&FilterValue2=" + country}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with nominations"
            valueText={pendingSignInGroups.length + "/" + allGroups.length}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Organisations"
            valueText={organisations.length}
            textColor="orange"
            url={configuration.OrganisationListUrl + "?FilterField1=Country&FilterValue1=" + country}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={signedInGroups.length + "/" + allGroups.length}
            textColor="blue"
          ></IndicatorCard>
        </Box>
        {userInfo.isAdmin && <Button
          variant="contained"
          onClick={() => {
            window.open(configuration.UserListUrl, '_blank');
          }}
        >
          Manage users
        </Button>}
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
          <CountryProgress
            meetings={meetings}
            consultations={consultations}
            country={country}
            configuration={configuration}
          ></CountryProgress>
        </Box>
      </Box>
    </div>
  );
}
