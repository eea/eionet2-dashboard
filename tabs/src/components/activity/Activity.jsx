import { React, useState, useEffect } from 'react';
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
import { ConsultationList } from './ConsultationList';
import { EventList } from './EventList';
import { getConsultations, getMeetings, getPublications } from '../../data/sharepointProvider';
import CustomDrawer from '../CustomDrawer';
import { PublicatonList } from './PublicationList';

export function Activity({
  userInfo,
  country,
  configuration,
  setData4Menu,
  openRating,
  openApproval,
  drawerOpen,
}) {
  const [tabsValue, setTabsValue] = useState(0),
    [pastMeetings, setPastMeetings] = useState([]),
    [currentMeetings, setCurrentMeetings] = useState([]),
    [upcomingMeetings, setUpcomingMeetings] = useState([]),
    [openConsultations, setOpenConsultations] = useState([]),
    [reviewConsultations, setReviewConsultations] = useState([]),
    [finalisedConsultations, setFinalisedConsultations] = useState([]),
    [openSurveys, setOpenSurveys] = useState([]),
    [reviewSurveys, setReviewSurveys] = useState([]),
    [finalisedSurveys, setFinalisedSurveys] = useState([]),
    [futurePublications, setFuturePublications] = useState([]),
    [pastPublications, setPastPublications] = useState([]),
    [loading, setloading] = useState(false);

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
          onClick={() => setTabsValue(0)}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Ongoing(' + currentMeetings.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={2}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 1 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(1)}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Upcoming(' + upcomingMeetings.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={3}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 2 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(2)}
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
          onClick={() => setTabsValue(3)}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Open (' + openConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={6}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 4 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(4)}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Review(' + reviewConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={7}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 5 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(5)}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Finalised(' + finalisedConsultations.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={8}>
        <ListItemText
          className="list-item-text"
          primary={'INQUIRIES'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={9}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 6 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(6)}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Open(' + openSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={10}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 7 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(7)}
        >
          <ListItemIcon className="list-item-icon">
            <FastForwardOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Review(' + reviewSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={11}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 8 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(8)}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Finalised(' + finalisedSurveys.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={12}>
        <ListItemText
          className="list-item-text"
          primary={'PUBLICATIONS'}
          sx={{ color: 'primary.main' }}
        />
      </ListItem>
      <ListItem disablePadding className="list-item" key={13}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 9 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(9)}
        >
          <ListItemIcon className="list-item-icon">
            <LoopIcon />
          </ListItemIcon>
          <ListItemText primary={'Future(' + futurePublications.length + ')'} />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding className="list-item" key={14}>
        <ListItemButton
          className={'list-item-button ' + (tabsValue == 10 ? ' drawer-item-selected' : '')}
          onClick={() => setTabsValue(10)}
        >
          <ListItemIcon className="list-item-icon">
            <HistoryOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={'Past(' + pastPublications.length + ')'} />
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

      const loadedMeetings = await getMeetings(fromDate, country, userInfo),
        loadedConsultations = await getConsultations(undefined, fromDate, country);
      let loadedPublications = await getPublications();

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

      if (loadedConsultations) {
        setOpenConsultations(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Consultation &&
              c.Closed >= new Date()
            );
          }),
        );
        setReviewConsultations(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Consultation &&
              c.Closed < new Date() &&
              c.Deadline >= new Date()
            );
          }),
        );
        setFinalisedConsultations(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Consultation &&
              c.Closed <= new Date() &&
              c.Deadline < new Date()
            );
          }),
        );

        setOpenSurveys(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Survey && c.Closed >= new Date()
            );
          }),
        );
        setReviewSurveys(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Survey &&
              c.Closed < new Date() &&
              c.Deadline >= new Date()
            );
          }),
        );
        setFinalisedSurveys(
          loadedConsultations.filter((c) => {
            return (
              c.ConsultationType == Constants.ConsultationType.Survey &&
              c.Closed <= new Date() &&
              c.Deadline < new Date()
            );
          }),
        );
      }

      if (loadedPublications) {
        const typeFilter = configuration.PublicationsType
          ? configuration.PublicationsType.split(';').map((p) => p.toLowerCase())
          : [];
        loadedPublications = loadedPublications.filter(
          (p) => !p.ItemType || p.ItemType.some((it) => typeFilter.includes(it.toLowerCase())),
        );
        setFuturePublications(loadedPublications.filter((p) => !p.IsPast));
        setPastPublications(loadedPublications.filter((p) => p.IsPast));
      }

      setloading(false);
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
          {tabsValue >= 3 && tabsValue <= 5 && (
            <ConsultationList
              userInfo={userInfo}
              configuration={configuration}
              openConsultations={openConsultations}
              reviewConsultations={reviewConsultations}
              finalisedConsultations={finalisedConsultations}
              type={Constants.ConsultationType.Consultation}
              tabsValue={tabsValue - 3}
            ></ConsultationList>
          )}
          {tabsValue >= 6 && tabsValue <= 8 && (
            <ConsultationList
              userInfo={userInfo}
              configuration={configuration}
              openConsultations={openSurveys}
              reviewConsultations={reviewSurveys}
              finalisedConsultations={finalisedSurveys}
              type={Constants.ConsultationType.Survey}
              tabsValue={tabsValue - 6}
            ></ConsultationList>
          )}
          {tabsValue >= 9 && tabsValue <= 10 && (
            <PublicatonList
              userInfo={userInfo}
              configuration={configuration}
              futurePublications={futurePublications}
              pastPublications={pastPublications}
              tabsValue={tabsValue - 9}
            ></PublicatonList>
          )}
        </Box>
        {false && <span>{userInfo.toString()}</span>}
      </Box>
    </div>
  );
}
