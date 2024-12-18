import React, { useState, useEffect, useCallback } from 'react';
import {
  Backdrop,
  CircularProgress,
  Box,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import './activity.scss';

import Constants from '../../data/constants.json';
import LoopIcon from '@mui/icons-material/Loop';
import FastForwardOutlinedIcon from '@mui/icons-material/FastForwardOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import NextPlanOutlinedIcon from '@mui/icons-material/NextPlanOutlined';

import { ConsultationList } from './ConsultationList';
import { EventList } from './EventList';
import {
  getConsultations,
  getMeetings,
  getPublications,
  getObligations,
} from '../../data/sharepointProvider';
import CustomDrawer from '../CustomDrawer';
import { PublicatonList } from './PublicationList';
import { ObligationList } from './ObligationList';

import { useAppInsightsContext } from '@microsoft/applicationinsights-react-js';

export function Activity({
  userInfo,
  country,
  configuration,
  setData4Menu,
  openRating,
  openApproval,
  drawerOpen,
  closeDrawer,
}) {
  const appInsights = useAppInsightsContext();

  const [tabsValue, setTabsValue] = useState(0),
    [pastMeetings, setPastMeetings] = useState([]),
    [currentMeetings, setCurrentMeetings] = useState([]),
    [upcomingMeetings, setUpcomingMeetings] = useState([]),
    [openConsultations, setOpenConsultations] = useState([]),
    [reviewConsultations, setReviewConsultations] = useState([]),
    [finalisedConsultations, setFinalisedConsultations] = useState([]),
    [futureConsultations, setFutureConsultations] = useState([]),
    [openSurveys, setOpenSurveys] = useState([]),
    [reviewSurveys, setReviewSurveys] = useState([]),
    [finalisedSurveys, setFinalisedSurveys] = useState([]),
    [futureSurveys, setFutureSurveys] = useState([]),
    [futurePublications, setFuturePublications] = useState([]),
    [pastPublications, setPastPublications] = useState([]),
    [upcomingObligations, setUpcomingObligations] = useState([]),
    [continuousObligations, setContinuousObligations] = useState([]),
    [loading, setloading] = useState(false);

  const onMenuClick = useCallback(
    (value, menu) => {
      setTabsValue(value);
      closeDrawer();
      appInsights.trackEvent({
        name: menu,
        properties: {
          page: 'Activity',
        },
      });
    },
    [appInsights],
  );

  const drawerOptions = (
    <div>
      <ListItem disablePadding className="list-item" key={0}>
        <ListItemText
          className="list-item-text"
          primary={'EVENTS'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={1}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 0 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(0, 'UpcomingEvents')}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Upcoming(' + upcomingMeetings.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={2}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 1 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(1, 'OngoingEvents')}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Ongoing(' + currentMeetings.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={3}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 2 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(2, 'PastEvents')}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Past(' + pastMeetings.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={4}>
        <ListItemText
          className="list-item-text"
          primary={'CONSULTATIONS'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={5}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 3 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(3, 'FutureConsultations')}
        >
          <ListItemIcon className="list-item-icon">
            <NextPlanOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Future(' + futureConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={6}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 4 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(4, 'OpenConsultations')}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Open (' + openConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={7}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 5 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(5, 'ReviewConsultations')}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'EEA Review(' + reviewConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={8}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 6 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(6, 'FinalisedConsultations')}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Finalised(' + finalisedConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>

      <ListItem disablePadding className="list-item" key={9}>
        <ListItemText
          className="list-item-text"
          primary={'ENQUIRIES'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={10}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 7 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(7, 'FutureEnquiries')}
        >
          <ListItemIcon className="list-item-icon">
            <NextPlanOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Future(' + futureSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={11}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 8 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(8, 'OpenEnquiries')}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Open(' + openSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={12}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 9 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(9, 'ReviewEnquiries')}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'EEA Review(' + reviewSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={13}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 10 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(10, 'FinalisedEnquiries')}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Finalised(' + finalisedSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={14}>
        <ListItemText
          className="list-item-text"
          primary={'PUBLICATIONS & OUTREACH'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={15}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 11 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(11, 'FuturePublications')}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Future(' + futurePublications.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={16}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 12 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(12, 'PastPublications')}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Past(' + pastPublications.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={17}>
        <ListItemText
          className="list-item-text"
          primary={'REPORTING OBLIGATIONS'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={18}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 13 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(13, 'UpcomingObligations')}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Upcoming(' + upcomingObligations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={19}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 14 ? ' drawer-item-selected' : '')}
          onClick={() => onMenuClick(14, 'ContinuousObligations')}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Continuous(' + continuousObligations.length + ')'} />
        </ListItemButton>
      </ListItem>
    </div>
  );

  //get old data according to configuration. 24 months if no configuration made
  const monthsBehind = configuration.DashboardNumberOfMonthsData || 24;
  useEffect(() => {
    (async () => {
      setloading(true);

      let fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - monthsBehind);

      getMeetings(fromDate, country, userInfo)
        .then((loadedMeetings) => {
          if (loadedMeetings) {
            setCurrentMeetings(
              loadedMeetings.filter((c) => {
                return c.IsCurrent;
              }),
            );
            setUpcomingMeetings(
              loadedMeetings.filter((c) => {
                return c.IsUpcoming;
              }),
            );
            setPastMeetings(
              loadedMeetings.filter((c) => {
                return c.IsPast;
              }),
            );
          }

          setData4Menu(loadedMeetings);
          setloading(false);
        })
        .catch((e) => {
          setloading(false);
          console.log(e.message);
        });

      getConsultations(fromDate, country).then((loadedConsultations) => {
        if (loadedConsultations) {
          const currentDate = new Date(new Date().toDateString());
          setOpenConsultations(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Consultation &&
                c.Closed >= currentDate &&
                c.Startdate <= currentDate
              );
            }),
          );
          setReviewConsultations(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Consultation &&
                c.Closed < currentDate &&
                c.Deadline >= currentDate
              );
            }),
          );
          setFinalisedConsultations(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Consultation &&
                c.Closed <= currentDate &&
                c.Deadline < currentDate
              );
            }),
          );
          setFutureConsultations(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Consultation &&
                c.Startdate > currentDate
              );
            }),
          );

          setOpenSurveys(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Survey &&
                c.Closed >= currentDate &&
                c.Startdate <= currentDate
              );
            }),
          );
          setReviewSurveys(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Survey &&
                c.Closed < currentDate &&
                c.Deadline >= currentDate
              );
            }),
          );
          setFinalisedSurveys(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Survey &&
                c.Closed <= currentDate &&
                c.Deadline < currentDate
              );
            }),
          );
          setFutureSurveys(
            loadedConsultations.filter((c) => {
              return (
                c.ConsultationType == Constants.ConsultationType.Survey && c.Startdate > currentDate
              );
            }),
          );
        }
      });

      getPublications().then((result) => {
        if (result) {
          const typeFilter = configuration.PublicationsType
            ? configuration.PublicationsType.split(';').map((p) => p.toLowerCase())
            : [];
          const loadedPublications = result.filter(
            (p) => !p.ItemType || typeFilter.includes(p.ItemType.toLowerCase()),
          );
          setFuturePublications(loadedPublications.filter((p) => !p.IsPast));
          setPastPublications(loadedPublications.filter((p) => p.IsPast));
        }
      });

      getObligations().then((result) => {
        if (result) {
          setUpcomingObligations(result.filter((p) => p.IsUpcoming && !p.IsContinuous));
          setContinuousObligations(result.filter((p) => p.IsContinuous));
        }
      });
    })();
  }, [monthsBehind, userInfo, country]);

  return (
    <div className="main">
      <Box sx={{ overflowY: 'scroll', display: 'flex', height: '100%' }}>
        <Backdrop
          sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
        {drawerOpen && <CustomDrawer drawerOptions={drawerOptions}></CustomDrawer>}
        <Box sx={{ width: '100%' }}>
          {tabsValue >= 0 && tabsValue <= 2 && (
            <EventList
              userInfo={userInfo}
              configuration={configuration}
              pastMeetings={pastMeetings}
              currentMeetings={currentMeetings}
              upcomingMeetings={upcomingMeetings}
              country={country}
              tabsValue={tabsValue}
              openRating={openRating}
              openApproval={openApproval}
            ></EventList>
          )}
          {tabsValue >= 3 && tabsValue <= 6 && (
            <ConsultationList
              configuration={configuration}
              openConsultations={openConsultations}
              reviewConsultations={reviewConsultations}
              finalisedConsultations={finalisedConsultations}
              futureConsultations={futureConsultations}
              type={Constants.ConsultationType.Consultation}
              country={country}
              tabsValue={tabsValue - 3}
            ></ConsultationList>
          )}
          {tabsValue >= 7 && tabsValue <= 10 && (
            <ConsultationList
              configuration={configuration}
              openConsultations={openSurveys}
              reviewConsultations={reviewSurveys}
              finalisedConsultations={finalisedSurveys}
              futureConsultations={futureSurveys}
              type={Constants.ConsultationType.Survey}
              country={country}
              tabsValue={tabsValue - 7}
            ></ConsultationList>
          )}
          {tabsValue >= 11 && tabsValue <= 12 && (
            <PublicatonList
              userInfo={userInfo}
              configuration={configuration}
              futurePublications={futurePublications}
              pastPublications={pastPublications}
              tabsValue={tabsValue - 11}
            ></PublicatonList>
          )}
          {tabsValue >= 13 && tabsValue <= 14 && (
            <ObligationList
              userInfo={userInfo}
              configuration={configuration}
              upcomingObligations={upcomingObligations}
              continuousObligations={continuousObligations}
              tabsValue={tabsValue - 13}
            ></ObligationList>
          )}
        </Box>
      </Box>
    </div>
  );
}
