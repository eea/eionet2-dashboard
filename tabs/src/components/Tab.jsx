import { React, useState, useEffect, useCallback } from 'react';

import { getMe } from '../data/provider';
import { useConfiguration } from '../data/hooks/useConfiguration';
import { getCountries, getCurrentParticipant } from '../data/sharepointProvider';

import {
  Backdrop,
  CircularProgress,
  AppBar,
  Toolbar,
  MenuItem,
  Typography,
  Autocomplete,
  Box,
  TextField,
  BottomNavigation,
  Paper,
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import FeedIcon from '@mui/icons-material/Feed';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import './Tab.scss';

import { UserMenu } from './UserMenu';
import { Activity } from './activity/Activity';
import { MyCountry } from './my_country/MyCountry';
import { Publications } from './publications/Publications';
import { UserEdit } from './self_service/UserEdit';
import { ApprovalDialog } from './event_registration/ApprovalDialog';
import { EventRatingDialog } from './event_rating/EventRatingDialog';

const theme = createTheme({
  palette: {
    primary: {
      light: '#00A390',
      main: '#004B7F',
      dark: '#005248',
    },
    secondary: {
      light: '#006BB8',
      main: '#007B6C',
      dark: '#003052',
    },
    tertiary: {
      light: '',
      main: '#747678',
      dark: '',
    },
    error: {
      main: '#B83230',
    },
    warning: {
      main: '#FF9933',
    },
    success: {
      main: '#007B6C',
    },
    info: {
      main: '#004B7F',
    },
    text: {
      primary: '#3D5265',
    },
    suplementary: {
      main: '#F9F9F9',
      text: '#3D5265',
    },
  },
  components: {
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          maxWidth: '250px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
        },
      },
    },
  },
});

export default function Tab() {
  const configuration = useConfiguration();

  const [userInfo, setUserInfo] = useState({
      isAdmin: false,
      isNFP: false,
      isGuest: true,
      country: '',
      isLoaded: false,
    }),
    [selfInfo, setSelfInfo] = useState({}),
    [userMenuData, setUserMenuData] = useState({
      event2Approve: [],
      events2Rate: [],
    }),
    [isEionetUser, setIsEionetUser] = useState(false),
    [selectedCountry, setSelectedCountry] = useState(''),
    [countries, setCountries] = useState([]),
    [canChangeCountry, setCanChangeCountry] = useState(false),
    [loading, setloading] = useState(false),
    [participant, setParticipant] = useState({}),
    [selectedEvent, setSelectedEvent] = useState({}),
    [approvalVisible, setApprovalVisible] = useState(false),
    [ratingVisible, setRatingVisible] = useState(false);

  useEffect(() => {
    (async () => {
      setloading(true);
      let me = await getMe();
      setUserInfo({
        isAdmin: true, // me.isAdmin,
        isNFP: false, //me.isNFP,
        isGuest: me.isGuest,
        country: me.country,
        isEionetUser: me.isEionetUser,
        isLoaded: true,
        mail: me.mail,
        displayName: me.displayName,
        givenName: me.givenName,
        surname: me.surname,
      });

      setSelectedCountry(me.country);

      if (me.isAdmin) {
        setCanChangeCountry(true);
        const loadedCountries = await getCountries();
        loadedCountries && setCountries(loadedCountries);
      }

      me.isLoaded = true;
      setSelfInfo(me);
      setIsEionetUser(me && me.isEionetUser);
      setloading(false);
    })();
  }, [getMe]);

  const [menuId, setMenuId] = useState(1),
    onMenuClick = (index) => {
      setMenuId(index);
    },
    openSelfService = () => {
      setMenuId(4);
    },
    activityVisible = useCallback(() => {
      return userInfo.isLoaded && menuId == 1;
    }, [userInfo, menuId]),
    myCountryVisible = useCallback(() => {
      return userInfo.isLoaded && menuId == 2;
    }, [userInfo, menuId]),
    publicationsVisible = useCallback(() => {
      return userInfo.isLoaded && menuId == 3;
    }, [userInfo, menuId]),
    selfServiceVisible = useCallback(() => {
      return selfInfo && selfInfo.isLoaded && menuId == 4 && isEionetUser;
    }, [selfInfo, menuId, isEionetUser]);

  const setData4Menu = useCallback(
      (events) => {
        const event2Approve = events
            .filter(
              (e) =>
                e.IsUpcoming &&
                e.IsOffline &&
                e.Participants &&
                e.Participants.length > 0 &&
                e.Participants.filter((p) => !p.NFPApproved || p.NFPApproved == 'No value').length >
                  0,
            )
            .slice(0, 5),
          events2Rate = events.filter((e) => !e.IsUpcoming && !!e.AllowVote).slice(0, 5);

        setUserMenuData({
          allEvents: events,
          event2Approve: event2Approve,
          events2Rate: events2Rate,
        });
      },
      [userMenuData],
    ),
    refreshData4Menu = useCallback(() => {
      setData4Menu(userMenuData.allEvents);
    }, [userMenuData]),
    openRating = useCallback(async (event) => {
      const participant = await getCurrentParticipant(event, userInfo);
      setSelectedEvent(event);
      setParticipant(participant);
      setRatingVisible(true);
    }, []),
    openApproval = useCallback(async (event) => {
      const participant = await getCurrentParticipant(event, userInfo);
      setSelectedEvent(event);
      setParticipant(participant);
      setApprovalVisible(true);
    }, []),
    handleApprovalClose = () => {
      refreshData4Menu();
      setApprovalVisible(false);
    },
    handleRatingClose = (result) => {
      setRatingVisible(false);
      selectedEvent.HasVoted = result;
      selectedEvent.AllowVote = !result;
      refreshData4Menu();
    };

  const nonIsoCountryCodes = {
      el: 'gr',
      io: '',
      uk: 'gb',
    },
    preProcessCountryCode = (code) => {
      return Object.prototype.hasOwnProperty.call(nonIsoCountryCodes, code)
        ? nonIsoCountryCodes[code]
        : code;
    };

  return (
    <div className="main">
      <ThemeProvider theme={theme}>
        <Backdrop
          sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="primary" />
        </Backdrop>
        <AppBar
          color="suplementary"
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <MenuItem onClick={() => onMenuClick(1)}>
              <Typography
                color="suplementary.text"
                className={'appbar-item' + (menuId == 1 ? ' appbar-item-selected' : '')}
              >
                Activity
              </Typography>
            </MenuItem>
            <MenuItem onClick={() => onMenuClick(2)}>
              <Typography className={'appbar-item' + (menuId == 2 ? ' appbar-item-selected' : '')}>
                My country
              </Typography>
              {selectedCountry && preProcessCountryCode(selectedCountry.toLowerCase()) && (
                <img
                  loading="lazy"
                  src={`https://flagcdn.com/h20/${preProcessCountryCode(
                    selectedCountry.toLowerCase(),
                  )}.png`}
                  alt=""
                />
              )}
            </MenuItem>
            {canChangeCountry && (
              <Autocomplete
                sx={{
                  width: '5%',
                }}
                disablePortal
                id="country"
                defaultValue={userInfo.country}
                options={countries}
                onChange={async (_e, value) => {
                  setSelectedCountry(value);
                }}
                renderOption={(props, option) => {
                  const countryCode = preProcessCountryCode(option.toLowerCase());
                  return (
                    <Box component="li" sx={{ '& > img': { ml: 2, flexShrink: 0 } }} {...props}>
                      {option}
                      {countryCode && (
                        <img
                          loading="lazy"
                          width="20"
                          src={`https://flagcdn.com/w20/${countryCode}.png`}
                          alt=""
                        />
                      )}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField autoComplete="off" {...params} variant="standard" />
                )}
              />
            )}
            {false && (
              <MenuItem onClick={() => onMenuClick(3)}>
                <Typography sx={{ textAlign: 'center', marginRight: '0.5rem' }}>
                  Publications
                </Typography>
                <FeedIcon></FeedIcon>
              </MenuItem>
            )}
            {userInfo.isEionetUser && (
              <Box sx={{ width: '100%', fontSize: '0.8rem', display: 'flex' }}>
                <UserMenu
                  userInfo={userInfo}
                  openSelfService={openSelfService}
                  events2Rate={userMenuData.events2Rate}
                  events2Approve={userMenuData.event2Approve}
                  openRating={openRating}
                  openApproval={openApproval}
                ></UserMenu>
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <ApprovalDialog
          open={approvalVisible}
          handleClose={handleApprovalClose}
          event={selectedEvent}
          userInfo={userInfo}
        ></ApprovalDialog>
        <EventRatingDialog
          open={ratingVisible}
          handleClose={handleRatingClose}
          event={selectedEvent}
          participant={participant}
        ></EventRatingDialog>

        {activityVisible() && (
          <Activity
            userInfo={userInfo}
            configuration={configuration}
            setData4Menu={setData4Menu}
            openRating={openRating}
            openApproval={openApproval}
          />
        )}
        {myCountryVisible() && (
          <MyCountry
            userInfo={userInfo}
            selectedCountry={selectedCountry}
            configuration={configuration}
          />
        )}
        {publicationsVisible() && <Publications userInfo={userInfo} />}
        {selfServiceVisible() && <UserEdit user={selfInfo} />}
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          elevation={5}
        >
          <BottomNavigation
            sx={{ display: 'flex', justifyContent: 'flex-start', border: '2px', height: '55px' }}
          >
            <Typography
              style={{
                paddingLeft: '20px',
                paddingRight: '10px',
                alignSelf: 'center',
                fontSize: '14px',
              }}
              color="tertiary"
            >
              These links open <br />
              in separate windows.
            </Typography>
            <Box sx={{ display: 'flex', alignSelf: 'center', height: '30px' }}>
              <Button
                className="bottom-button"
                color="tertiary"
                variant="outlined"
                endIcon={<OpenInNewIcon color="primary" />}
                onClick={() => {
                  window.open(configuration.MeetingListUrl, '_blank');
                }}
              >
                View all meetings
              </Button>
              <Button
                className="bottom-button"
                color="tertiary"
                variant="outlined"
                endIcon={<OpenInNewIcon color="primary" />}
                onClick={() => {
                  window.open(configuration.ConsultationListUrl, '_blank');
                }}
              >
                View all consultations
              </Button>
              <Button
                className="bottom-button"
                color="tertiary"
                variant="outlined"
                endIcon={<OpenInNewIcon color="primary" />}
                onClick={() => {
                  window.open(configuration.ConsultationListUrl, '_blank');
                }}
              >
                View all inquiries
              </Button>
            </Box>
            <Typography
              align="center"
              sx={{
                position: 'absolute',
                right: 0,
                alignSelf: 'center',
                fontSize: '0.8rem',
                pr: '0.2rem',
              }}
            >
              v{`${process.env.REACT_APP_VERSION}`}
            </Typography>
          </BottomNavigation>
        </Paper>
      </ThemeProvider>
    </div>
  );
}
