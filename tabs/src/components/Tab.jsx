import { React, useState, useEffect } from 'react';
import { getMe } from '../data/provider';
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
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import FlagCircleIcon from '@mui/icons-material/FlagCircle';
import FeedIcon from '@mui/icons-material/Feed';
import DashboardIcon from '@mui/icons-material/Dashboard';

var showFunction = Boolean(process.env.REACT_APP_FUNC_NAME);

export default function Tab() {
  const [userInfo, setUserInfo] = useState({
      isAdmin: false,
      isNFP: false,
      isGuest: true,
      country: '',
      isLoaded: false,
    }),
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
        isLoaded: true,
      });
      setloading(false);
    })();
  }, []);

  const [menuId, setMenuId] = useState(1),
    onMenuClick = (index) => {
      setMenuId(index);
    },
    activityVisible = () => {
      return menuId == 1;
    };

  return (
    <div>
      <Backdrop
        sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <AppBar
        color="primary"
        position="relative"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <DashboardIcon sx={{ margin: '0.5rem' }}></DashboardIcon>
          <MenuItem onClick={() => onMenuClick(1)}>
            <Typography sx={{ textAlign: 'center', marginRight: '0.5rem' }}>
              Eionet Activity
            </Typography>
            <InsightsIcon></InsightsIcon>
          </MenuItem>
          <MenuItem onClick={() => onMenuClick(2)}>
            <Typography sx={{ textAlign: 'center', marginRight: '0.5rem' }}>
              Eionet in my country
            </Typography>
            <FlagCircleIcon></FlagCircleIcon>
          </MenuItem>
          <MenuItem onClick={() => onMenuClick(3)}>
            <Typography sx={{ textAlign: 'center', marginRight: '0.5rem' }}>
              Publications
            </Typography>
            <FeedIcon></FeedIcon>
          </MenuItem>
        </Toolbar>
      </AppBar>

      {activityVisible() && (
        <Activity showFunction={showFunction} userInfo={userInfo} />
      )}
      {!activityVisible() && (
        <MyCountry showFunction={showFunction} userInfo={userInfo} />
      )}
      {!activityVisible() == 3 && (
        <Publications showFunction={showFunction} userInfo={userInfo} />
      )}
    </div>
  );
}
