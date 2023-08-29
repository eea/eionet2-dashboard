import { React } from 'react';
import { Box, Typography } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';
import { HtmlBox } from '../HtmlBox';

export function AtAGlance({
  meetings,
  consultations,
  users,
  organisations,
  country,
  userInfo,
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
        <Typography
          sx={{ fontSize: '16px', fontWeight: '600', pt: '12px', pl: '12px' }}
          color="text.secondary"
        >
          Representation:
        </Typography>
        <Box className="cards-container" sx={{ border: '0px' }}>
          <IndicatorCard
            labelText="members"
            valueText={users.length}
            url={configuration.UserListUrl + countryFilterSuffix}
            infoText={configuration.NoOfMembersCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="members pending sign in"
            valueText={users.length - signedInUsers.length}
            url={
              configuration.UserListUrl +
              countryFilterSuffix +
              'FilterField2=SignedIn&FilterValue2=0'
            }
            infoText={configuration.MembersPendingSingInCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="organisations"
            valueText={organisations.length}
            url={configuration.OrganisationListUrl + countryFilterSuffix}
            infoText={configuration.NoOfOrganisationsCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="groups with nominations"
            valueText={nominationsGroups.length + '/' + availableGroups.length}
            infoText={configuration.GroupsWithNominationsCardInfo}
          ></IndicatorCard>
          <IndicatorCard
            labelText="groups with signed in users"
            valueText={signedInGroups.length + '/' + availableGroups.length}
            infoText={configuration.GroupsWithSignedInUsersCardInfo}
          ></IndicatorCard>
        </Box>
        {userInfo.isEionetUser && (
          <Box sx={{ marginLeft: '1rem' }}>
            <HtmlBox html={configuration.CountryProgressHtml}></HtmlBox>
          </Box>
        )}
        {userInfo.isEionetUser && (
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
        )}
      </Box>
    </div>
  );
}
