import { React, useState, useEffect } from 'react';
import { Box, Typography, Tab, Tabs } from '@mui/material';
import PropTypes from 'prop-types';
import { YearlyProgress } from './YearlyProgress';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export function CountryProgress({ meetings, consultations, country, configuration }) {
  const [lastFiveYears, setLastFiveYears] = useState([]);
  const [tabsValue, setTabsValue] = useState(0),
    handleChange = (_event, newValue) => {
      setTabsValue(newValue);
    };
  useEffect(() => {
    const current = new Date().getFullYear();
    let years = [];
    for (let i = current; i >= current - 4; i--) {
      years.push(i);
    }
    setLastFiveYears(years);
  }, []);

  return (
    <div className="">
      {lastFiveYears.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Tabs value={tabsValue} onChange={handleChange}>
            {lastFiveYears.map((year, index) => {
              return <Tab className="year-tab" key={index} label={year} {...a11yProps(index)} />;
            })}
          </Tabs>
          {lastFiveYears.map((year, index) => {
            return (
              <TabPanel className="year-panel" key={index} value={tabsValue} index={index}>
                <YearlyProgress
                  meetings={meetings.filter((m) => m.Year == year)}
                  consultations={consultations.filter((c) => c.Year == year)}
                  year={year}
                  country={country}
                  configuration={configuration}
                ></YearlyProgress>
              </TabPanel>
            );
          })}
        </Box>
      )}
    </div>
  );
}
