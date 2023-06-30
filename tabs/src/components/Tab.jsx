import { React, useState, useEffect } from 'react';
import { getMe } from '../data/provider';
import { getConfiguration } from '../data/apiProvider';
import { getCountries } from '../data/sharepointProvider';
import { Activity } from './activity/Activity';
import { MyCountry } from './my_country/MyCountry';
import { Publications } from './publications/Publications';
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
  Avatar,
  BottomNavigation,
  Paper,
  BottomNavigationAction,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import FeedIcon from '@mui/icons-material/Feed';
import ListAltIcon from '@mui/icons-material/ListAlt';
import './Tab.scss';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#00A390',
      main: '#007B6C',
      dark: '#005248',
    },
    secondary: {
      light: '#006BB8',
      main: '#004B7F',
      dark: '#003052',
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
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
        },
      },
    },
  },
});

const showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function Tab() {
  const [userInfo, setUserInfo] = useState({
      isAdmin: false,
      isNFP: false,
      isGuest: true,
      country: '',
      isLoaded: false,
    }),
    [selectedCountry, setSelectedCountry] = useState(''),
    [countries, setCountries] = useState([]),
    [configuration, setConfiguration] = useState({}),
    [canChangeCountry, setCanChangeCountry] = useState(false),
    [loading, setloading] = useState(false);

  useEffect(() => {
    (async () => {
      setloading(true);
      let me = await getMe();
      setUserInfo({
        isAdmin: me.isAdmin,
        isNFP: true, //me.isNFP,
        isGuest: me.isGuest,
        country: me.country,
        isInList: me.isInList,
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

      let loadedConfiguration = await getConfiguration();
      if (loadedConfiguration) {
        setConfiguration(loadedConfiguration);
      }
      setloading(false);
    })();
  }, []);

  const [menuId, setMenuId] = useState(1),
    onMenuClick = (index) => {
      setMenuId(index);
    },
    activityVisible = () => {
      return userInfo.isLoaded && menuId == 1;
    },
    myCountryVisible = () => {
      return userInfo.isLoaded && menuId == 2;
    },
    publicationsVisible = () => {
      return userInfo.isLoaded && menuId == 3;
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
                Eionet Activity
              </Typography>
              <Avatar className="country-flag" sx={{ backgroundColor: 'white' }}>
                <InsightsIcon color="secondary"></InsightsIcon>
              </Avatar>
            </MenuItem>
            <MenuItem onClick={() => onMenuClick(2)}>
              <Typography className={'appbar-item' + (menuId == 2 ? ' appbar-item-selected' : '')}>
                Eionet in my country
              </Typography>
              {selectedCountry && preProcessCountryCode(selectedCountry.toLowerCase()) && (
                <Avatar
                  className="country-flag"
                  src={`https://flagcdn.com/h40/${preProcessCountryCode(
                    selectedCountry.toLowerCase(),
                  )}.png`}
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
            <Typography align="right" sx={{ width: '100%', fontSize: '0.8rem' }}>
              v{`${process.env.REACT_APP_VERSION}`}
            </Typography>
          </Toolbar>
        </AppBar>

        {activityVisible() && (
          <Activity showFunction={showFunction} userInfo={userInfo} configuration={configuration} />
        )}
        {myCountryVisible() && (
          <MyCountry
            showFunction={showFunction}
            userInfo={userInfo}
            selectedCountry={selectedCountry}
            configuration={configuration}
          />
        )}
        {publicationsVisible() && <Publications showFunction={showFunction} userInfo={userInfo} />}
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={5}>
          <BottomNavigation sx={{ border: '2px', height: '130px' }} showLabels>
            <BottomNavigationAction
              label="View all meetings"
              onClick={() => {
                window.open(configuration.MeetingListUrl, '_blank');
              }}
              icon={<ListAltIcon />}
            ></BottomNavigationAction>
            <BottomNavigationAction
              sx={{ width: '800px' }}
              label="View all consultations"
              onClick={() => {
                window.open(configuration.ConsultationListUrl, '_blank');
              }}
              icon={<ListAltIcon />}
            ></BottomNavigationAction>
            <BottomNavigationAction
              label="View all inquiries"
              onClick={() => {
                window.open(configuration.ConsultationListUrl, '_blank');
              }}
              icon={<ListAltIcon />}
            ></BottomNavigationAction>
          </BottomNavigation>
        </Paper>
      </ThemeProvider>
    </div>
  );
}
