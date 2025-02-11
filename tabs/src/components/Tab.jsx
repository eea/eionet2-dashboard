import React, { useState, useEffect, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';

import { getMe } from '../data/provider';
import { useConfiguration } from '../data/hooks/useConfiguration';
import { getCountries, getCurrentParticipant, getParticipants } from '../data/sharepointProvider';

import {
  Backdrop,
  CircularProgress,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Typography,
  Autocomplete,
  Box,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SummarizeIcon from '@mui/icons-material/Summarize';

import './Tab.scss';

import { UserMenu } from './UserMenu';
import { BottomMenu } from './BottomMenu';
import { Activity } from './activity/Activity';
import { MyCountry } from './my_country/MyCountry';
import { UserEdit } from './self_service/UserEdit';
import { ApprovalDialog } from './event_registration/ApprovalDialog';
import { EventRatingDialog } from './event_rating/EventRatingDialog';
import { HtmlBox } from './HtmlBox';

import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { reactPlugin } from '../data/appInsights';

import Constants from '../data/constants.json';

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
  const isMobile = useMediaQuery({ query: `(max-width: ${Constants.MobileMaxWidth})` });
  const configuration = useConfiguration();

  const version = process.env.REACT_APP_VERSION;

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
    [loading, setLoading] = useState(false),
    [participant, setParticipant] = useState({}),
    [selectedEvent, setSelectedEvent] = useState({}),
    [approvalVisible, setApprovalVisible] = useState(false),
    [ratingVisible, setRatingVisible] = useState(false),
    [versionDialogOpen, setVersionDialogOpen] = useState(false),
    [drawerOpen, setDrawerOpen] = useState(!isMobile);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let me = await getMe();
      setSelectedCountry(me.country);
      setUserInfo({
        isAdmin: me.isAdmin,
        isNFP: me.isNFP,
        isGuest: me.isGuest,
        country: me.country,
        isEionetUser: me.isEionetUser,
        isLoaded: true,
        mail: me.mail,
        displayName: me.displayName,
        givenName: me.givenName,
        surname: me.surname,
      });

      if (me.isAdmin || !me.isEionetUser) {
        setCanChangeCountry(true);
        const loadedCountries = await getCountries();
        loadedCountries && setCountries(loadedCountries);
      }

      me.isLoaded = true;
      setSelfInfo(me);
      setIsEionetUser(me?.isEionetUser);
      setLoading(false);
      !!configuration.DashboardVersion &&
        setVersionDialogOpen(configuration.DashboardVersion != version);
    })();
  }, [getMe, configuration]);

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
    selfServiceVisible = useCallback(() => {
      return selfInfo?.isLoaded && menuId == 4 && isEionetUser;
    }, [selfInfo, menuId, isEionetUser]);

  const setData4Menu = useCallback(
      (events) => {
        const event2Approve = events.filter(
            (e) =>
              e.IsUpcoming &&
              e.IsOffline &&
              e.Participants &&
              e.Participants.length > 0 &&
              e.Participants.filter((p) => !p.NFPApproved || p.NFPApproved == 'No value').length >
                0,
          ),
          events2Rate = events.filter((e) => !e.IsUpcoming && !!e.AllowVote);

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
    openRating = useCallback(
      async (event) => {
        setLoading(true);
        const participant = await getCurrentParticipant(event, userInfo);
        setSelectedEvent(event);
        setParticipant(participant);
        setRatingVisible(true);
        setLoading(false);
      },
      [userInfo],
    ),
    openApproval = useCallback(
      async (event) => {
        setLoading(true);
        const participant = await getCurrentParticipant(event, userInfo);
        event.Participants = await getParticipants(event.id, userInfo.country);
        setSelectedEvent(event);
        setParticipant(participant);
        setApprovalVisible(true);
        setLoading(false);
      },
      [userInfo],
    ),
    handleApprovalClose = () => {
      refreshData4Menu();
      setApprovalVisible(false);
    },
    handleRatingClose = (result) => {
      setRatingVisible(false);
      selectedEvent.HasVoted = result;
      selectedEvent.AllowVote = !result;
      refreshData4Menu();
    },
    handleVersionDialogClose = () => {
      setVersionDialogOpen(false);
    },
    handleDrawerOpen = () => {
      setDrawerOpen(!drawerOpen);
    },
    closeDrawer = useCallback(() => {
      isMobile && setDrawerOpen(false);
    }, [isMobile]);

  const nonIsoCountryCodes = {
      el: 'gr',
      io: '',
      uk: 'gb',
    },
    preProcessCountryCode = (code) => {
      return Object.hasOwn(nonIsoCountryCodes, code) ? nonIsoCountryCodes[code] : code;
    };

  const [anchorEl, setAnchorEl] = React.useState(null),
    openMobileMenu = Boolean(anchorEl),
    handleMobileMenuClick = (event) => {
      setAnchorEl(event.currentTarget);
    },
    handleMenuClose = () => {
      setAnchorEl(null);
    };

  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <div className="main">
        <ThemeProvider theme={theme}>
          <Backdrop
            sx={{ color: 'primary.main', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
          >
            <CircularProgress color="primary" />
          </Backdrop>
          <AppBar
            color="suplementary"
            position="sticky"
            className="header"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                >
                  {!drawerOpen && <MenuIcon fontSize="large" />}
                  {drawerOpen && <ChevronLeftIcon fontSize="large" />}
                </IconButton>
              )}
              {!isMobile && (
                <>
                  <MenuItem onClick={() => onMenuClick(1)}>
                    <Typography
                      color="suplementary.text"
                      className={'appbar-item' + (menuId == 1 ? ' appbar-item-selected' : '')}
                    >
                      Activity
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={() => onMenuClick(2)}>
                    <Typography
                      className={'appbar-item' + (menuId == 2 ? ' appbar-item-selected' : '')}
                    >
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
                </>
              )}
              {isMobile && (
                <>
                  <IconButton
                    aria-controls={openMobileMenu ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMobileMenu ? 'true' : undefined}
                    onClick={handleMobileMenuClick}
                    text={'Dashboard'}
                    color="inherit"
                    edge="start"
                  >
                    <SummarizeIcon fontSize="large" />
                  </IconButton>

                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openMobileMenu}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        onMenuClick(1);
                        handleMenuClose();
                      }}
                    >
                      Activity
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onMenuClick(2);
                        handleMenuClose();
                      }}
                    >
                      My country
                    </MenuItem>
                  </Menu>
                  {selectedCountry && preProcessCountryCode(selectedCountry.toLowerCase()) && (
                    <img
                      style={{ paddingRight: '0.75rem' }}
                      loading="lazy"
                      src={`https://flagcdn.com/h20/${preProcessCountryCode(
                        selectedCountry.toLowerCase(),
                      )}.png`}
                      alt=""
                    />
                  )}
                </>
              )}
              {canChangeCountry && (
                <Autocomplete
                  sx={{
                    width: 100,
                    [theme.breakpoints.up('sm')]: {
                      width: 80,
                    },
                  }}
                  componentsProps={{
                    paper: {
                      sx: {
                        width: 100,
                      },
                    },
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
          <Dialog open={versionDialogOpen} onClose={handleVersionDialogClose}>
            <DialogTitle>
              <IconButton
                aria-label="close"
                onClick={handleVersionDialogClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <Typography>Application version</Typography>
            </DialogTitle>
            <Box sx={{ margin: '2rem' }}>
              <HtmlBox html={configuration?.AppVersionMessage}></HtmlBox>
            </Box>
          </Dialog>
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

          <div className="content">
            {activityVisible() && (
              <Activity
                userInfo={userInfo}
                country={selectedCountry}
                configuration={configuration}
                setData4Menu={setData4Menu}
                openRating={openRating}
                openApproval={openApproval}
                drawerOpen={drawerOpen}
                closeDrawer={closeDrawer}
              />
            )}
            {myCountryVisible() && (
              <MyCountry
                userInfo={userInfo}
                selectedCountry={selectedCountry}
                configuration={configuration}
                drawerOpen={drawerOpen}
                closeDrawer={closeDrawer}
              />
            )}
            {selfServiceVisible() && <UserEdit user={selfInfo} configuration={configuration} />}
          </div>
          <Paper className="footer" elevation={5}>
            <BottomMenu configuration={configuration}></BottomMenu>
          </Paper>
        </ThemeProvider>
      </div>
    </AppInsightsContext.Provider>
  );
}
