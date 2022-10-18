
import { React, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { AtAGlance } from './AtAGlance';

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

export function MyCountry({ userInfo }) {
    const [tabsValue, setTabsValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabsValue(newValue);
    };
    return (
        <div className="">
            <Box
                sx={{
                    boxShadow: 2,
                }}
            >
                <Tabs value={tabsValue} onChange={handleChange}>
                    <Tab label="At a glance" {...a11yProps(0)} />
                    <Tab label="Management board" {...a11yProps(1)} />
                    <Tab label="NFPs" {...a11yProps(2)} />
                    <Tab label="Eionet groups" {...a11yProps(4)} />
                    <Tab label="ETCs" {...a11yProps(5)} />
                    <Tab label="Scientific committee" {...a11yProps(6)} />
                    <Tab label="Data reporters" {...a11yProps(7)} />
                </Tabs>

                <TabPanel value={tabsValue} index={0}>
                    <AtAGlance></AtAGlance>
                </TabPanel>
                <TabPanel value={tabsValue} index={1}>
                </TabPanel>
                <TabPanel value={tabsValue} index={2}>
                    Item Three
                </TabPanel>
                <TabPanel value={tabsValue} index={2}>
                    Item Three
                </TabPanel>
                {false && <span>{userInfo.toString()}</span>}
            </Box>
        </div >
    );
}
