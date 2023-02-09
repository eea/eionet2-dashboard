import { React } from 'react';
import { Box } from '@mui/material';
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
  availableGroups,
}) {
  const signedInUsers = users.filter((u) => {
      return u.SignedIn;
    }),
    signedInGroups = getGroups(signedInUsers),
    pendingSignInUsers = users.filter((u) => {
      return !u.SignedIn;
    }),
    pendingSignInGroups = getGroups(pendingSignInUsers),
    nominationsGroups = [...new Set(signedInGroups.concat(pendingSignInGroups))],
    countryFilterSuffix = country ? '?FilterField1=Country&FilterValue1=' + country + '&' : '?';
  return (
    <div className="">
      <Box
        sx={{
          height: '80%',
        }}
      >
        <Box className="cards-container">
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
            valueText={nominationsGroups.length + '/' + availableGroups.length}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={signedInGroups.length + '/' + availableGroups.length}
            textColor="blue"
          ></IndicatorCard>
        </Box>
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
