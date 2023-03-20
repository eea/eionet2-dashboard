import { React, useState, useEffect } from 'react';
import { getMe } from '../data/provider';
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
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import FeedIcon from '@mui/icons-material/Feed';
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
    [canChangeCountry, setCanChangeCountry] = useState(false),
    [loading, setloading] = useState(false);

  useEffect(() => {
    (async () => {
      setloading(true);
      let me = await getMe();
      setUserInfo({
        isAdmin: me.isAdmin,
        isNFP: me.isNFP,
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
          <CircularProgress color="inherit" />
        </Backdrop>
        <AppBar
          color="suplementary"
          position="relative"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <MenuItem onClick={() => onMenuClick(1)}>
              <Typography color="suplementary.text" className="appbar-item">
                Eionet Activity
              </Typography>
              <Avatar className="country-flag" sx={{ backgroundColor: 'white' }}>
                <InsightsIcon color="secondary"></InsightsIcon>
              </Avatar>
            </MenuItem>
            <MenuItem onClick={() => onMenuClick(2)}>
              <Typography className="appbar-item">Eionet in my country</Typography>
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

        {activityVisible() && <Activity showFunction={showFunction} userInfo={userInfo} />}
        {myCountryVisible() && (
          <MyCountry
            showFunction={showFunction}
            userInfo={userInfo}
            selectedCountry={selectedCountry}
          />
        )}
        {publicationsVisible() && <Publications showFunction={showFunction} userInfo={userInfo} />}
      </ThemeProvider>
    </div>
  );
}
