import { React, useState, useEffect } from 'react';
import { getConfiguration } from '../../data/apiProvider';
import { getConsultations } from '../../data/sharepointProvider';
import { DataGrid } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import {
  Backdrop,
  CircularProgress,
  Box,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';

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

export function ConsultationList() {
  const [openConsultations, setOpenConsultations] = useState([]),
    [reviewConsultations, setReviewConsultations] = useState([]),
    [finalisedConsultations, setFinalisedConsultations] = useState([]),
    [configuration, setConfiguration] = useState({}),
    [loading, setloading] = useState(false);

  const columns = [
    { field: 'Title', headerName: 'Consultation', flex: 0.75 },
    { field: 'Startdate', headerName: 'Start date', flex: 0.75 },
  ];
  useEffect(() => {
    (async () => {
      setloading(true);
      let consultations = await getConsultations('Consultation');
      if (consultations) {
        setOpenConsultations(
          consultations.filter((c) => {
            return !c.Closed;
          })
        );
        setReviewConsultations(
          consultations.filter((c) => {
            return c.Deadline;
          })
        );
        setFinalisedConsultations(
          consultations.filter((c) => {
            return c.Enddate;
          })
        );
      }

      let configuration = await getConfiguration();
      if (configuration) {
        setConfiguration(configuration);
      }
      setloading(false);
    })();
  }, []);

  const [tabsValue, setTabsValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabsValue(newValue);
  };

  return (
    <div className="">
      {false && <span>{configuration.toString()}</span>}
      <Box
        sx={{
          boxShadow: 2,
        }}
      >
        <Backdrop
          sx={{ color: '#6b32a8', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <Box sx={{ display: 'flex', height: '85%', width: '100%' }}>
          <Tabs
            value={tabsValue}
            onChange={handleChange}
            orientation="vertical"
          >
            <Tab label="Open" {...a11yProps(0)} />
            <Tab label="Review" {...a11yProps(1)} />
            <Tab label="Finalised" {...a11yProps(2)} />
          </Tabs>
          <TabPanel
            style={{ width: '100%', height: '95%' }}
            value={tabsValue}
            index={0}
          >
            <DataGrid
              rows={openConsultations}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel
            style={{ width: '100%', height: '95%' }}
            value={tabsValue}
            index={1}
          >
            <DataGrid
              rows={reviewConsultations}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
          <TabPanel
            style={{ width: '100%', height: '95%' }}
            value={tabsValue}
            index={2}
          >
            <DataGrid
              rows={finalisedConsultations}
              columns={columns}
              pageSize={25}
              rowsPerPageOptions={[25]}
              hideFooterSelectedRowCount={true}
              getRowHeight={() => {
                return 36;
              }}
            />
          </TabPanel>
        </Box>
      </Box>
    </div>
  );
}
