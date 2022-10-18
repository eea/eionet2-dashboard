
import { React, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { ConsultationList } from './ConsultationList';
import { EventList } from './EventList';

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

export function Activity({ userInfo }) {
    const [tabsValue, setTabsValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabsValue(newValue);
    };
    return (
        <div className="">
            <Box>
                <Tabs value={tabsValue} onChange={handleChange}>
                    <Tab label="Events" {...a11yProps(0)} />
                    <Tab label="Consultations" {...a11yProps(1)} />
                    <Tab label="Surveys" {...a11yProps(2)} />
                    <Tab label="Reporting" {...a11yProps(3)} />
                </Tabs>

                <TabPanel value={tabsValue} index={0}>
                    <EventList></EventList>
                </TabPanel>
                <TabPanel value={tabsValue} index={1}>
                    <ConsultationList></ConsultationList>
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
