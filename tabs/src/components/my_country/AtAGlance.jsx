import React, { useState, useEffect } from 'react';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';
import { HtmlBox } from '../HtmlBox';
import { getMeetings, getConsultations } from '../../data/sharepointProvider';
import Constants from '../../data/constants.json';

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
    signedInGroups = getGroups(signedInUsers, true),
    pendingSignInUsers = users.filter((u) => {
      return !u.SignedIn;
    }),
    pendingSignInGroups = getGroups(pendingSignInUsers, true),
    nominationsGroups = [...new Set(signedInGroups.concat(pendingSignInGroups))],
    countryFilterSuffix = country ? '?FilterField1=Country&FilterValue1=' + country + '&' : '?';

  const [lastYears, setLastYears] = useState([]),
    [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      //get meetings from last two years
      const noOfYears = configuration.DashboardNoOfDisplayedYears || 2;
      const nowDate = new Date(),
        fromDate = new Date(nowDate.getFullYear() - noOfYears, 0, 1);

      let loadedMeetings = await getMeetings(fromDate, country, userInfo),
        loadedConsultations = await getConsultations(fromDate);

      loadedMeetings = loadedMeetings.filter(
        (meeting) =>
          !meeting.Group ||
          !meeting.Group.every((gr) => gr.toLowerCase().startsWith(Constants.WorkingGroupPrefix)),
      );
      loadedConsultations = loadedConsultations.filter(
        (consultation) =>
          !consultation.EionetGroups ||
          !consultation.EionetGroups.every((gr) =>
            gr.toLowerCase().startsWith(Constants.WorkingGroupPrefix),
          ),
      );

      const current = nowDate.getFullYear();
      let years = [];
      for (let i = current; i >= current - noOfYears + 1; i--) {
        const allMeetings = loadedMeetings.filter((m) => m.Year == i && m.IsPast),
          allConsultations = loadedConsultations.filter(
            (c) =>
              c.Year == i &&
              c.Deadline < nowDate &&
              c.ConsultationType == Constants.ConsultationType.Consultation,
          ),
          allSurveys = loadedConsultations.filter(
            (c) =>
              c.Year == i &&
              c.Deadline < nowDate &&
              c.ConsultationType == Constants.ConsultationType.Survey,
          );

        const yearFilter = `&FilterField2=Year&FilterValue2=${i}&FilterType2=Number`;
        const result = {
          year: i,
          meetingsCount: allMeetings.length,
          meetingsUrl: `${configuration.MeetingListUrl}?FilterField1=Countries&FilterValue1=${country}${yearFilter}`,
          attendedMeetingsCount: allMeetings.filter((meeting) => {
            return meeting.Participants.some(
              (participant) => participant.Country == country && participant.Participated,
            );
          }).length,
          consultationsCount: allConsultations.length,
          //!!! ConsultationListUrl already contains a filter in configuration
          consultationsUrl: `${configuration.ConsultationListUrl}${yearFilter}&FilterField3=Respondants&FilterValue3=${country}`,
          responseConsultationsCount: allConsultations.filter((c) => {
            return c.Respondants.includes(country);
          }).length,
          surveysCount: allSurveys.length,
          //!!! InquiryListUrl already contains a filter in configuration
          surveysUrl: `${configuration.InquiryListUrl}${yearFilter}&FilterField3=Respondants&FilterValue3=${country}`,
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
  }, [country, userInfo, configuration]);

  return (
    <div className="">
      <Box
        sx={{
          height: 'fit-content',
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
      >
        <Backdrop
          sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
        <Typography className="subtitle" sx={{ pt: '12px', pl: '12px' }} color="text.secondary">
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
