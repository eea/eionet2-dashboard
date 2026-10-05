import React, { useState, useEffect } from 'react';
import { Box, Typography, Backdrop, CircularProgress } from '@mui/material';
import { IndicatorCard } from './IndicatorCard';
import { CardColumns } from './CardColumns';
import { CountryProgress } from './CountryProgress';
import { getGroups } from '../../data/sharepointProvider';
import { HtmlBox } from '../HtmlBox';
import { getMeetings, getConsultations } from '../../data/sharepointProvider';
import Constants from '../../data/constants.json';

const isWorkingGroup = (group) => group.toLowerCase().startsWith(Constants.WorkingGroupPrefix),
  isNotApplicableGroup = (group) => group.toLowerCase() === Constants.NotApplicableGroup,
  toGroupItems = (groups) =>
    groups.map((group) => {
      return { id: group, Name: group };
    }),
  toMeetingItem = (meeting) => {
    return {
      id: meeting.id,
      Name: meeting.Title,
      Date: meeting.MeetingStart,
      Link: meeting.Linktofolder || meeting.ItemLink,
    };
  },
  toConsultationItem = (consultation) => {
    return {
      id: consultation.id,
      Name: consultation.Title,
      Date: consultation.Closed,
      Link: consultation.Linktofolder || consultation.ItemLink,
    };
  };

export function AtAGlance({
  users,
  organisations,
  country,
  userInfo,
  configuration,
  availableGroups,
  availableWorkingGroups,
}) {
  const signedInUsers = users.filter((u) => {
      return u.SignedIn;
    }),
    nominationGroups = getGroups(users, true).sort(),
    groupsWithoutNominations = availableGroups
      .filter((gr) => !nominationGroups.includes(gr))
      .sort(),
    workingGroupNominations = getGroups(users).filter(isWorkingGroup).sort(),
    workingGroupsWithoutNominations = availableWorkingGroups
      .filter((gr) => !workingGroupNominations.includes(gr))
      .sort(),
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
          !meeting.Group.every((gr) => isWorkingGroup(gr) || isNotApplicableGroup(gr)),
      );
      loadedConsultations = loadedConsultations.filter(
        (consultation) =>
          !consultation.EionetGroups || !consultation.EionetGroups.every(isWorkingGroup),
      );

      const current = nowDate.getFullYear();
      let years = [];
      for (let i = current; i >= current - noOfYears + 1; i--) {
        const allMeetings = loadedMeetings.filter((m) => m.Year == i && m.IsPast),
          allConsultations = loadedConsultations.filter(
            (c) =>
              c.Deadline.getFullYear() == i &&
              c.Deadline < nowDate &&
              c.ConsultationType == Constants.ConsultationType.Consultation,
          ),
          allSurveys = loadedConsultations.filter(
            (c) =>
              c.Deadline.getFullYear() == i &&
              c.Deadline < nowDate &&
              c.ConsultationType == Constants.ConsultationType.Survey,
          );

        const attendedMeetings = allMeetings.filter((m) => m.Countries?.includes(country)),
          respondedConsultations = allConsultations.filter((c) => c.Respondants?.includes(country)),
          respondedSurveys = allSurveys.filter((c) => c.Respondants?.includes(country));

        const result = {
          year: i,
          meetingsCount: allMeetings.length,
          attendedMeetingsCount: attendedMeetings.length,
          attendedMeetings: attendedMeetings.map(toMeetingItem),
          notAttendedMeetings: allMeetings
            .filter((m) => !m.Countries?.includes(country))
            .map(toMeetingItem),
          consultationsCount: allConsultations.length,
          responseConsultationsCount: respondedConsultations.length,
          respondedConsultations: respondedConsultations.map(toConsultationItem),
          notRespondedConsultations: allConsultations
            .filter((c) => !c.Respondants?.includes(country))
            .map(toConsultationItem),
          surveysCount: allSurveys.length,
          responseSurveysCount: respondedSurveys.length,
          respondedSurveys: respondedSurveys.map(toConsultationItem),
          notRespondedSurveys: allSurveys
            .filter((c) => !c.Respondants?.includes(country))
            .map(toConsultationItem),
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
            labelText="Eionet groups and thematic groups with nominations"
            valueText={nominationGroups.length + '/' + availableGroups.length}
            infoText={configuration.GroupsWithNominationsCardInfo}
            dialogTitle="Eionet and thematic groups"
            dialogContent={
              <CardColumns
                columns={[
                  { title: 'With nominations', items: toGroupItems(nominationGroups) },
                  {
                    title: 'Without nominations',
                    items: toGroupItems(groupsWithoutNominations),
                  },
                ]}
              ></CardColumns>
            }
          ></IndicatorCard>
          <IndicatorCard
            labelText="Working groups with nominations"
            valueText={workingGroupNominations.length + '/' + availableWorkingGroups.length}
            infoText={configuration.WorkingGroupsWithNominationsCardInfo}
            dialogTitle="Working groups"
            dialogContent={
              <CardColumns
                columns={[
                  { title: 'With nominations', items: toGroupItems(workingGroupNominations) },
                  {
                    title: 'Without nominations',
                    items: toGroupItems(workingGroupsWithoutNominations),
                  },
                ]}
              ></CardColumns>
            }
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
