import { React } from 'react';
import { Box } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';
import DOMPurify from 'dompurify';

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
          height: '100%',
          overflowX: 'hidden',
        }}
      >
        <Box className="cards-container">
          <IndicatorCard
            labelText="Number of members"
            valueText={signedInUsers.length}
            url={
              configuration.UserListUrl +
              countryFilterSuffix +
              'FilterField2=SignedIn&FilterValue2=1'
            }
            infoText={configuration.NoOfMembersCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Members pending sign in"
            valueText={users.length - signedInUsers.length}
            url={
              configuration.UserListUrl +
              countryFilterSuffix +
              'FilterField2=SignedIn&FilterValue2=0'
            }
            infoText={configuration.MembersPendingSingInCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Number of organisations"
            valueText={organisations.length}
            url={configuration.OrganisationListUrl + countryFilterSuffix}
            infoText={configuration.NoOfOrganisationsCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with nominations"
            valueText={nominationsGroups.length + '/' + availableGroups.length}
            infoText={configuration.GroupsWithNominationsCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="Groups with signed in users"
            valueText={signedInGroups.length + '/' + availableGroups.length}
            infoText={configuration.GroupsWithSignedInUsersCardInfo}
          ></IndicatorCard>
        </Box>
        {configuration.CountryProgressHtml && (
          <Box
            sx={{ width: '100%', marginLeft: '1rem' }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(configuration.CountryProgressHtml),
            }}
          />
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
