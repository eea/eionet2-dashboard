import { React } from 'react';
import { Box, Button } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';

export function AtAGlance({
  meetings,
  consultations,
  users,
  organisations,
  country,
  configuration,
  userInfo,
}) {
  const signedInUsers = users.filter((u) => {
      return u.SignedIn;
    }),
    signedInGroups = getGroups(signedInUsers),
    pendingSignInUsers = users.filter((u) => {
      return !u.SignedIn;
    }),
    pendingSignInGroups = getGroups(pendingSignInUsers),
    allGroups = getGroups(users),
    countryFilterSuffix = country ? '?FilterField1=Country&FilterValue1=' + country + '&' : '?';
  return (
    <div className="">
      <Box
        sx={{
          height: '80%',
        }}
      >
        <Box sx={{ display: 'flex', textAlign: 'center' }}>
          <IndicatorCard
            labelText="Users signed in"
            valueText={signedInUsers.length}
            textColor="lightgreen"
            url={
              configuration.UserListUrl +
              countryFilterSuffix +
              'FilterField2=SignedIn&FilterValue2=1'
            }
          ></IndicatorCard>
          <IndicatorCard
            labelText="Users pending sign in"
            valueText={users.length - signedInUsers.length}
            textColor="#F5E216"
            url={
              configuration.UserListUrl +
              countryFilterSuffix +
              'FilterField2=SignedIn&FilterValue2=0'
            }
          ></IndicatorCard>
          <IndicatorCard
            labelText="Organisations"
            valueText={organisations.length}
            textColor="orange"
            url={configuration.OrganisationListUrl + countryFilterSuffix}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with nominations"
            valueText={pendingSignInGroups.length + '/' + allGroups.length}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={signedInGroups.length + '/' + allGroups.length}
            textColor="blue"
          ></IndicatorCard>
        </Box>
        {userInfo.isAdmin && (
          <Button
            sx={{ margin: '1rem' }}
            variant="contained"
            onClick={() => {
              window.open(configuration.UserListUrl, '_blank');
            }}
          >
            Manage users
          </Button>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flexGrow: 1,
            marginLeft: '1rem',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
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
