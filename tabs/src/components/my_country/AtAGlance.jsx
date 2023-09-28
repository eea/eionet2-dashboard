import { React, useState, useEffect } from 'react';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';
import { HtmlBox } from '../HtmlBox';
import { getMeetings, getConsultations } from '../../data/sharepointProvider';

export function AtAGlance({
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

  const [lastYears, setLastYears] = useState([]),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      //get meetings from last two years
      const fromDate = new Date(new Date().getFullYear() - 2, 0, 1);
      let loadedMeetings = await getMeetings(fromDate, country, userInfo),
        loadedConsultations = await getConsultations(undefined, fromDate);

      const current = new Date().getFullYear();
      let years = [];
      for (let i = current; i >= current - 1; i--) {
        const allMeetings = loadedMeetings.filter((m) => m.Year == i),
          allConsultations = loadedConsultations.filter(
            (c) => c.Year == i && c.ConsultationType == 'Consultation',
          ),
          allSurveys = loadedConsultations.filter(
            (c) => c.Year == i && c.ConsultationType == 'Inquiry',
          );

        const result = {
          year: i,
          meetingsCount: allMeetings.length,
          consultationsCount: allConsultations.length,
          surveysCount: allSurveys.length,
          attendedMeetingsCount: allMeetings.filter((meeting) => {
            return meeting.Participants.some((participant) => participant.Country == country);
          }).length,
          responseConsultationsCount: allConsultations.filter((c) => {
            return c.Respondants.includes(country);
          }).length,
          responseSurveysCount: allSurveys.filter((c) => {
            return c.Respondants.includes(country);
          }).length,
        };
        years.push(result);
      }
      setLastYears(years);
      setLoading(false);
    };
    fetchData();
  }, [country, userInfo]);

  return (
    <div className="">
      <Box
        sx={{
          height: '100%',
          overflowX: 'hidden',
        }}
      >
        <Backdrop
          sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
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
        {country && (
          <Box sx={{ marginLeft: '1rem' }}>
            <HtmlBox html={configuration.CountryProgressHtml}></HtmlBox>
          </Box>
        )}
        {country && (
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
            <CountryProgress lastYears={lastYears} configuration={configuration}></CountryProgress>
          </Box>
        )}
      </Box>
    </div>
  );
}
